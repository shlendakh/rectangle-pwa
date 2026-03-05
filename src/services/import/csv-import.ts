import { csvRowSchema } from "./import.schema"
import type { ImportedRectangleData, RectangleRequest } from "@/services/rectangle/rectangle.types"

type ParsedCsvRectangleData = Omit<ImportedRectangleData, "sheet" | "configuration">

const DELIMITER_CANDIDATES = [",", ";", "\t"] as const

function normalizeHeader(value: string): string {
  return value
    .replace(/^\ufeff/, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_()-]+/g, "")
}

function findHeaderIndex(headers: string[], aliases: string[]): number | undefined {
  for (const alias of aliases) {
    const index = headers.findIndex((header) => header === alias)

    if (index !== -1) {
      return index
    }
  }

  return undefined
}

function parseCsvRows(text: string, delimiter: string): string[][] {
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentField = ""
  let inQuotes = false

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    const nextCharacter = text[index + 1]

    if (inQuotes) {
      if (character === '"' && nextCharacter === '"') {
        currentField += '"'
        index += 1
        continue
      }

      if (character === '"') {
        inQuotes = false
        continue
      }

      currentField += character
      continue
    }

    if (character === '"') {
      inQuotes = true
      continue
    }

    if (character === delimiter) {
      currentRow.push(currentField)
      currentField = ""
      continue
    }

    if (character === "\n") {
      currentRow.push(currentField)
      rows.push(currentRow)
      currentRow = []
      currentField = ""
      continue
    }

    if (character === "\r") {
      continue
    }

    currentField += character
  }

  currentRow.push(currentField)
  rows.push(currentRow)

  return rows
}

function detectDelimiter(text: string): string {
  const firstNonEmptyLine = text
    .replace(/^\ufeff/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.length > 0)

  if (!firstNonEmptyLine) {
    return ","
  }

  let bestDelimiter = ","
  let bestScore = -1

  for (const delimiter of DELIMITER_CANDIDATES) {
    let inQuotes = false
    let score = 0

    for (let index = 0; index < firstNonEmptyLine.length; index += 1) {
      const character = firstNonEmptyLine[index]
      const nextCharacter = firstNonEmptyLine[index + 1]

      if (inQuotes) {
        if (character === '"' && nextCharacter === '"') {
          index += 1
          continue
        }

        if (character === '"') {
          inQuotes = false
        }

        continue
      }

      if (character === '"') {
        inQuotes = true
        continue
      }

      if (character === delimiter) {
        score += 1
      }
    }

    if (score > bestScore) {
      bestDelimiter = delimiter
      bestScore = score
    }
  }

  return bestDelimiter
}

function sanitizeRows(rows: string[][]): string[][] {
  return rows
    .map((row) => row.map((value) => value.trim()))
    .filter((row) => row.some((value) => value.length > 0))
}

export function parseRectanglesCsv(text: string, sourceFileName: string): ParsedCsvRectangleData {
  const delimiter = detectDelimiter(text)
  const parsedRows = sanitizeRows(parseCsvRows(text.replace(/^\ufeff/, ""), delimiter))

  if (parsedRows.length === 0) {
    throw new Error("CSV file is empty.")
  }

  const [headerRow, ...dataRows] = parsedRows

  if (dataRows.length === 0) {
    throw new Error("CSV file does not contain any data rows.")
  }

  const normalizedHeaders = headerRow.map(normalizeHeader)
  const qtyIndex = findHeaderIndex(normalizedHeaders, ["qty", "quantity"])
  const widthIndex = findHeaderIndex(normalizedHeaders, ["width"])
  const heightIndex = findHeaderIndex(normalizedHeaders, ["height"])
  const nameIndex = findHeaderIndex(normalizedHeaders, ["name"])

  if (qtyIndex === undefined || widthIndex === undefined || heightIndex === undefined) {
    throw new Error("CSV must contain Qty, Width and Height columns.")
  }

  const rectangles: RectangleRequest[] = dataRows.map((row, rowIndex) => {
    const csvRowNumber = rowIndex + 2
    const parsedRow = csvRowSchema.safeParse({
      name: nameIndex === undefined ? undefined : (row[nameIndex] ?? ""),
      quantity: row[qtyIndex] ?? "",
      width: row[widthIndex] ?? "",
      height: row[heightIndex] ?? "",
    })

    if (!parsedRow.success) {
      const issue = parsedRow.error.issues[0]
      throw new Error(`Invalid data in CSV row ${csvRowNumber}: ${issue.message}`)
    }

    const cleanName =
      parsedRow.data.name && parsedRow.data.name.length > 0 ? parsedRow.data.name : `Part ${rowIndex + 1}`

    return {
      name: cleanName,
      quantity: parsedRow.data.quantity,
      width: parsedRow.data.width,
      height: parsedRow.data.height,
    }
  })

  return {
    sourceFileName,
    importedAt: new Date().toISOString(),
    rectangles,
  }
}

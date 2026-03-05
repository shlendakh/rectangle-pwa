import { parseRectanglesCsv } from "./csv-import"

export function isCsvFileName(fileName: string): boolean {
  return fileName.toLowerCase().endsWith(".csv")
}

export async function parseRectanglesCsvFile(file: File) {
  const fileContent = await file.text()
  return parseRectanglesCsv(fileContent, file.name)
}

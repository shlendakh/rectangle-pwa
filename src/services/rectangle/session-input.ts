import { storedImportedDataSchema } from "./rectangle.schema"
import type { ImportedRectangleData } from "./rectangle.types"

const STORAGE_KEY = "rectangle-cut:imported-rectangles"

export function saveImportedRectangleData(data: ImportedRectangleData): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function loadImportedRectangleData(): ImportedRectangleData | null {
  const rawValue = sessionStorage.getItem(STORAGE_KEY)

  if (!rawValue) {
    return null
  }

  let parsedJson: unknown

  try {
    parsedJson = JSON.parse(rawValue)
  } catch {
    sessionStorage.removeItem(STORAGE_KEY)
    return null
  }

  const parsedData = storedImportedDataSchema.safeParse(parsedJson)

  if (!parsedData.success) {
    sessionStorage.removeItem(STORAGE_KEY)
    return null
  }

  return parsedData.data
}

export function clearImportedRectangleData(): void {
  sessionStorage.removeItem(STORAGE_KEY)
}

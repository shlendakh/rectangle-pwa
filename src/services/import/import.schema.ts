import { z } from "zod"
import { normalizeNumericString } from "./numeric-normalization"

function parseNormalizedNumber(value: unknown): unknown {
  if (typeof value === "number") {
    return value
  }

  if (typeof value !== "string") {
    return value
  }

  const normalized = normalizeNumericString(value)

  if (normalized.length === 0) {
    return Number.NaN
  }

  return Number(normalized)
}

const positiveConfigNumberSchema = z.preprocess(parseNormalizedNumber, z.number().positive())

const nonNegativeConfigNumberSchema = z.preprocess(parseNormalizedNumber, z.number().nonnegative())

export const importConfigSchema = z.object({
  sheetWidth: positiveConfigNumberSchema,
  sheetHeight: positiveConfigNumberSchema,
  kerf: nonNegativeConfigNumberSchema,
})

const positiveNumberFromCsvSchema = z.preprocess(parseNormalizedNumber, z.number().positive())

const positiveIntegerFromCsvSchema = z.preprocess(
  parseNormalizedNumber,
  z.number().int().positive(),
)

export const csvRowSchema = z.object({
  name: z.string().trim().optional(),
  quantity: positiveIntegerFromCsvSchema,
  width: positiveNumberFromCsvSchema,
  height: positiveNumberFromCsvSchema,
})

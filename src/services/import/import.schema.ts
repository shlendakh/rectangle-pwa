import { z } from "zod"
import { normalizeNumericString } from "./numeric-normalization"

const positiveConfigNumberSchema = z
  .string()
  .trim()
  .min(1)
  .transform(Number)
  .pipe(z.number().finite().positive())

const nonNegativeConfigNumberSchema = z
  .string()
  .trim()
  .min(1)
  .transform(Number)
  .pipe(z.number().finite().nonnegative())

export const importConfigSchema = z.object({
  sheetWidth: positiveConfigNumberSchema,
  sheetHeight: positiveConfigNumberSchema,
  kerf: nonNegativeConfigNumberSchema,
})

const positiveNumberFromCsvSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value
  }

  return Number.parseFloat(normalizeNumericString(value))
}, z.number().finite().positive())

const positiveIntegerFromCsvSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value
  }

  return Number.parseFloat(normalizeNumericString(value))
}, z.number().finite().int().positive())

export const csvRowSchema = z.object({
  name: z.string().trim().optional(),
  quantity: positiveIntegerFromCsvSchema,
  width: positiveNumberFromCsvSchema,
  height: positiveNumberFromCsvSchema,
})

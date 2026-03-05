import { z } from "zod"

const storedRectangleSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().int().positive(),
  width: z.number().positive(),
  height: z.number().positive(),
  canRotate: z.boolean().optional(),
})

export const storedImportedDataSchema = z.object({
  sourceFileName: z.string().min(1),
  importedAt: z.string().min(1),
  sheet: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
  }),
  configuration: z.object({
    kerf: z.number().nonnegative(),
    allowRotation: z.boolean(),
  }),
  rectangles: z.array(storedRectangleSchema).min(1),
})

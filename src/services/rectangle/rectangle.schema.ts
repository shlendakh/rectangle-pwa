import { z } from "zod"

const storedRectangleSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().int().positive(),
  width: z.number().positive(),
  height: z.number().positive(),
  canRotate: z.boolean().optional(),
})

const placementHeuristicSchema = z.enum([
  "bestAreaFit",
  "bestShortSideFit",
  "bestLongSideFit",
  "firstFit",
])

const splitHeuristicSchema = z.enum([
  "shorterLeftoverAxis",
  "longerLeftoverAxis",
  "shorterAxis",
  "longerAxis",
  "minimizeAreaSplit",
])

const pieceSortHeuristicSchema = z.enum(["areaDesc", "maxSideDesc", "perimeterDesc"])

const cutOrientationSchema = z.enum(["vertical", "horizontal"])

const storedSheetDefinitionSchema = z.object({
  width: z.number().positive(),
  height: z.number().positive(),
})

const storedPackingConfigurationSchema = z.object({
  kerf: z.number().nonnegative(),
  allowRotation: z.boolean(),
})

export const storedImportedDataSchema = z.object({
  sourceFileName: z.string().min(1),
  importedAt: z.string().min(1),
  sheet: storedSheetDefinitionSchema,
  configuration: storedPackingConfigurationSchema,
  rectangles: z.array(storedRectangleSchema).min(1),
})

const storedStrategySchema = z.object({
  id: z.string().min(1),
  placementHeuristic: placementHeuristicSchema,
  splitHeuristic: splitHeuristicSchema,
  pieceSortHeuristic: pieceSortHeuristicSchema,
})

const storedPieceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  width: z.number().positive(),
  height: z.number().positive(),
  canRotate: z.boolean(),
})

const storedPlacementSchema = z.object({
  pieceId: z.string().min(1),
  name: z.string().min(1),
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  rotated: z.boolean(),
  cutWidth: z.number().positive(),
  cutHeight: z.number().positive(),
})

const storedSheetCutSchema = z.object({
  id: z.string().min(1),
  order: z.number().int().nonnegative(),
  orientation: cutOrientationSchema,
  x1: z.number(),
  y1: z.number(),
  x2: z.number(),
  y2: z.number(),
  sourcePieceId: z.string().min(1),
})

const storedSheetLayoutSchema = z.object({
  index: z.number().int().nonnegative(),
  width: z.number().positive(),
  height: z.number().positive(),
  placements: z.array(storedPlacementSchema),
  cuts: z.array(storedSheetCutSchema),
  usedArea: z.number().nonnegative(),
  consumedArea: z.number().nonnegative(),
  freeArea: z.number().nonnegative(),
  utilization: z.number().nonnegative(),
})

const storedPackingStatsSchema = z.object({
  totalRequestedParts: z.number().int().positive(),
  placedParts: z.number().int().nonnegative(),
  totalSheets: z.number().int().nonnegative(),
  sheetArea: z.number().positive(),
  totalUsedArea: z.number().nonnegative(),
  totalConsumedArea: z.number().nonnegative(),
  totalFreeArea: z.number().nonnegative(),
  overallUtilization: z.number().nonnegative(),
  kerfWasteArea: z.number().nonnegative(),
})

const storedPackingResultSchema = z.object({
  strategy: storedStrategySchema,
  configuration: storedPackingConfigurationSchema,
  sheet: storedSheetDefinitionSchema,
  sheets: z.array(storedSheetLayoutSchema),
  unplacedPieces: z.array(storedPieceSchema),
  stats: storedPackingStatsSchema,
})

const storedStrategySummarySchema = z.object({
  strategyId: z.string().min(1),
  totalSheets: z.number().int().nonnegative(),
  unplacedCount: z.number().int().nonnegative(),
  utilization: z.number().nonnegative(),
  totalFreeArea: z.number().nonnegative(),
  kerfWasteArea: z.number().nonnegative(),
})

export const storedSolverFlowResultSchema = z.object({
  generatedAt: z.string().min(1),
  input: z.object({
    rectangles: z.array(storedRectangleSchema).min(1),
    sheet: storedSheetDefinitionSchema,
    configuration: storedPackingConfigurationSchema,
  }),
  bestResult: storedPackingResultSchema,
  strategySummaries: z.array(storedStrategySummarySchema).min(1),
})

export const storedCutHistoryEntrySchema = z.object({
  id: z.string().min(1),
  sourceFileName: z.string().min(1),
  generatedAt: z.string().min(1),
  importedData: storedImportedDataSchema,
  result: storedSolverFlowResultSchema,
})

export const storedCutHistorySchema = z.array(storedCutHistoryEntrySchema)

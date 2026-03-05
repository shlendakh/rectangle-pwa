export interface RectangleRequest {
  name: string
  width: number
  height: number
  quantity: number
  canRotate?: boolean
}

export interface SheetDefinition {
  width: number
  height: number
}

export interface PackingConfiguration {
  kerf: number
  allowRotation: boolean
}

export type PlacementHeuristic =
  | "bestAreaFit"
  | "bestShortSideFit"
  | "bestLongSideFit"
  | "firstFit"

export type SplitHeuristic =
  | "shorterLeftoverAxis"
  | "longerLeftoverAxis"
  | "shorterAxis"
  | "longerAxis"
  | "minimizeAreaSplit"

export type PieceSortHeuristic = "areaDesc" | "maxSideDesc" | "perimeterDesc"

export interface Strategy {
  id: string
  placementHeuristic: PlacementHeuristic
  splitHeuristic: SplitHeuristic
  pieceSortHeuristic: PieceSortHeuristic
}

export interface Piece {
  id: string
  name: string
  width: number
  height: number
  canRotate: boolean
}

export interface FreeRectangle {
  x: number
  y: number
  width: number
  height: number
}

export interface Placement {
  pieceId: string
  name: string
  x: number
  y: number
  width: number
  height: number
  rotated: boolean
  cutWidth: number
  cutHeight: number
}

export type CutOrientation = "vertical" | "horizontal"

export interface SheetCut {
  id: string
  order: number
  orientation: CutOrientation
  x1: number
  y1: number
  x2: number
  y2: number
  sourcePieceId: string
}

export interface SheetLayout {
  index: number
  width: number
  height: number
  placements: Placement[]
  cuts: SheetCut[]
  usedArea: number
  consumedArea: number
  freeArea: number
  utilization: number
}

export interface PackingStats {
  totalRequestedParts: number
  placedParts: number
  totalSheets: number
  sheetArea: number
  totalUsedArea: number
  totalConsumedArea: number
  totalFreeArea: number
  overallUtilization: number
  kerfWasteArea: number
}

export interface PackingResult {
  strategy: Strategy
  configuration: PackingConfiguration
  sheet: SheetDefinition
  sheets: SheetLayout[]
  unplacedPieces: Piece[]
  stats: PackingStats
}

export interface StrategySummary {
  strategyId: string
  totalSheets: number
  unplacedCount: number
  utilization: number
  totalFreeArea: number
  kerfWasteArea: number
}

export interface SolverFlowResult {
  generatedAt: string
  input: {
    rectangles: RectangleRequest[]
    sheet: SheetDefinition
    configuration: PackingConfiguration
  }
  bestResult: PackingResult
  strategySummaries: StrategySummary[]
}

export interface ImportedRectangleData {
  sourceFileName: string
  importedAt: string
  sheet: SheetDefinition
  configuration: PackingConfiguration
  rectangles: RectangleRequest[]
}

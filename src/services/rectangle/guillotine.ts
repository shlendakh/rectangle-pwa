import type {
  CutOrientation,
  FreeRectangle,
  PackingConfiguration,
  PackingResult,
  Piece,
  PieceSortHeuristic,
  Placement,
  PlacementHeuristic,
  RectangleRequest,
  SheetCut,
  SheetDefinition,
  SheetLayout,
  SplitHeuristic,
  Strategy,
} from "./rectangle.types"

const EPSILON = 1e-9

interface PieceOrientation {
  width: number
  height: number
  rotated: boolean
}

interface PlacementCandidate {
  freeIndex: number
  freeRectangle: FreeRectangle
  orientation: PieceOrientation
  cutWidth: number
  cutHeight: number
  leftoverWidth: number
  leftoverHeight: number
  rawLeftoverWidth: number
  rawLeftoverHeight: number
  wasteArea: number
  score: number[]
}

type SplitOrientation = "verticalFirst" | "horizontalFirst"

function clampToZero(value: number): number {
  return Math.abs(value) < EPSILON ? 0 : value
}

function isPositive(value: number): boolean {
  return value > EPSILON
}

function getPieceOrientations(piece: Piece, allowRotation: boolean): PieceOrientation[] {
  const orientations: PieceOrientation[] = [{ width: piece.width, height: piece.height, rotated: false }]

  if (allowRotation && piece.canRotate && piece.width !== piece.height) {
    orientations.push({ width: piece.height, height: piece.width, rotated: true })
  }

  return orientations
}

function isContained(inner: FreeRectangle, outer: FreeRectangle): boolean {
  return (
    inner.x + EPSILON >= outer.x &&
    inner.y + EPSILON >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width + EPSILON &&
    inner.y + inner.height <= outer.y + outer.height + EPSILON
  )
}

function sortFreeRectangles(freeRectangles: FreeRectangle[]): FreeRectangle[] {
  return [...freeRectangles].sort((left, right) => {
    if (left.y !== right.y) {
      return left.y - right.y
    }

    if (left.x !== right.x) {
      return left.x - right.x
    }

    if (left.width !== right.width) {
      return left.width - right.width
    }

    return left.height - right.height
  })
}

function pruneFreeRectangles(freeRectangles: FreeRectangle[]): FreeRectangle[] {
  const normalized = freeRectangles
    .map((rectangle) => ({
      ...rectangle,
      width: clampToZero(rectangle.width),
      height: clampToZero(rectangle.height),
    }))
    .filter((rectangle) => isPositive(rectangle.width) && isPositive(rectangle.height))

  const pruned = normalized.filter((rectangle, index, allRectangles) => {
    return !allRectangles.some((otherRectangle, otherIndex) => {
      if (index === otherIndex) {
        return false
      }

      return isContained(rectangle, otherRectangle)
    })
  })

  return sortFreeRectangles(pruned)
}

function buildPlacementScore(
  heuristic: PlacementHeuristic,
  candidate: {
    leftoverWidth: number
    leftoverHeight: number
    wasteArea: number
    freeIndex: number
    freeRectangle: FreeRectangle
  },
): number[] {
  const shortSide = Math.min(candidate.leftoverWidth, candidate.leftoverHeight)
  const longSide = Math.max(candidate.leftoverWidth, candidate.leftoverHeight)

  if (heuristic === "firstFit") {
    return [candidate.freeIndex, candidate.freeRectangle.y, candidate.freeRectangle.x, shortSide, longSide]
  }

  if (heuristic === "bestShortSideFit") {
    return [shortSide, longSide, candidate.wasteArea]
  }

  if (heuristic === "bestLongSideFit") {
    return [longSide, shortSide, candidate.wasteArea]
  }

  return [candidate.wasteArea, shortSide, longSide]
}

function compareScores(left: number[], right: number[]): number {
  const maxLength = Math.max(left.length, right.length)

  for (let index = 0; index < maxLength; index += 1) {
    const leftValue = left[index] ?? 0
    const rightValue = right[index] ?? 0

    if (leftValue !== rightValue) {
      return leftValue - rightValue
    }
  }

  return 0
}

function chooseSplitOrientation(
  splitHeuristic: SplitHeuristic,
  freeRectangle: FreeRectangle,
  leftoverWidth: number,
  leftoverHeight: number,
): SplitOrientation {
  if (splitHeuristic === "shorterLeftoverAxis") {
    return leftoverWidth <= leftoverHeight ? "verticalFirst" : "horizontalFirst"
  }

  if (splitHeuristic === "longerLeftoverAxis") {
    return leftoverWidth > leftoverHeight ? "verticalFirst" : "horizontalFirst"
  }

  if (splitHeuristic === "shorterAxis") {
    return freeRectangle.width <= freeRectangle.height ? "verticalFirst" : "horizontalFirst"
  }

  if (splitHeuristic === "longerAxis") {
    return freeRectangle.width > freeRectangle.height ? "verticalFirst" : "horizontalFirst"
  }

  const verticalFirstAreas = {
    right: leftoverWidth * freeRectangle.height,
    bottom: (freeRectangle.height - leftoverHeight) * leftoverHeight,
  }

  const horizontalFirstAreas = {
    right: leftoverWidth * (freeRectangle.height - leftoverHeight),
    bottom: freeRectangle.width * leftoverHeight,
  }

  const verticalFirstImbalance = Math.abs(verticalFirstAreas.right - verticalFirstAreas.bottom)
  const horizontalFirstImbalance = Math.abs(horizontalFirstAreas.right - horizontalFirstAreas.bottom)

  return verticalFirstImbalance <= horizontalFirstImbalance ? "verticalFirst" : "horizontalFirst"
}

function splitFreeRectangle(
  freeRectangle: FreeRectangle,
  cutWidth: number,
  cutHeight: number,
  splitOrientation: SplitOrientation,
): FreeRectangle[] {
  const leftoverWidth = clampToZero(freeRectangle.width - cutWidth)
  const leftoverHeight = clampToZero(freeRectangle.height - cutHeight)

  if (!isPositive(leftoverWidth) && !isPositive(leftoverHeight)) {
    return []
  }

  const rightRectangle: FreeRectangle =
    splitOrientation === "verticalFirst"
      ? {
          x: freeRectangle.x + cutWidth,
          y: freeRectangle.y,
          width: leftoverWidth,
          height: freeRectangle.height,
        }
      : {
          x: freeRectangle.x + cutWidth,
          y: freeRectangle.y,
          width: leftoverWidth,
          height: cutHeight,
        }

  const bottomRectangle: FreeRectangle =
    splitOrientation === "verticalFirst"
      ? {
          x: freeRectangle.x,
          y: freeRectangle.y + cutHeight,
          width: cutWidth,
          height: leftoverHeight,
        }
      : {
          x: freeRectangle.x,
          y: freeRectangle.y + cutHeight,
          width: freeRectangle.width,
          height: leftoverHeight,
        }

  return [rightRectangle, bottomRectangle].filter(
    (rectangle) => isPositive(rectangle.width) && isPositive(rectangle.height),
  )
}

function buildCut(
  orientation: CutOrientation,
  order: number,
  sourcePieceId: string,
  coordinates: { x1: number; y1: number; x2: number; y2: number },
): SheetCut {
  return {
    id: `cut-${order}`,
    order,
    orientation,
    sourcePieceId,
    ...coordinates,
  }
}

function createGuillotineCuts(
  pieceId: string,
  freeRectangle: FreeRectangle,
  pieceWidth: number,
  pieceHeight: number,
  splitOrientation: SplitOrientation,
  rawLeftoverWidth: number,
  rawLeftoverHeight: number,
  nextCutOrder: number,
): { cuts: SheetCut[]; nextCutOrder: number } {
  const cuts: SheetCut[] = []
  let currentCutOrder = nextCutOrder

  const hasVerticalCut = isPositive(rawLeftoverWidth)
  const hasHorizontalCut = isPositive(rawLeftoverHeight)

  const verticalCut = (fullHeight: boolean) =>
    buildCut("vertical", currentCutOrder, pieceId, {
      x1: freeRectangle.x + pieceWidth,
      y1: freeRectangle.y,
      x2: freeRectangle.x + pieceWidth,
      y2: freeRectangle.y + (fullHeight ? freeRectangle.height : pieceHeight),
    })

  const horizontalCut = (fullWidth: boolean) =>
    buildCut("horizontal", currentCutOrder, pieceId, {
      x1: freeRectangle.x,
      y1: freeRectangle.y + pieceHeight,
      x2: freeRectangle.x + (fullWidth ? freeRectangle.width : pieceWidth),
      y2: freeRectangle.y + pieceHeight,
    })

  if (splitOrientation === "verticalFirst") {
    if (hasVerticalCut) {
      cuts.push(verticalCut(true))
      currentCutOrder += 1
    }

    if (hasHorizontalCut) {
      cuts.push(horizontalCut(false))
      currentCutOrder += 1
    }
  } else {
    if (hasHorizontalCut) {
      cuts.push(horizontalCut(true))
      currentCutOrder += 1
    }

    if (hasVerticalCut) {
      cuts.push(verticalCut(false))
      currentCutOrder += 1
    }
  }

  return {
    cuts,
    nextCutOrder: currentCutOrder,
  }
}

function pickPlacementCandidate(
  piece: Piece,
  freeRectangles: FreeRectangle[],
  strategy: Strategy,
  configuration: PackingConfiguration,
): PlacementCandidate | undefined {
  const orientations = getPieceOrientations(piece, configuration.allowRotation)

  let bestCandidate: PlacementCandidate | undefined

  for (let freeIndex = 0; freeIndex < freeRectangles.length; freeIndex += 1) {
    const freeRectangle = freeRectangles[freeIndex]

    for (const orientation of orientations) {
      if (orientation.width > freeRectangle.width + EPSILON || orientation.height > freeRectangle.height + EPSILON) {
        continue
      }

      const rawLeftoverWidth = clampToZero(freeRectangle.width - orientation.width)
      const rawLeftoverHeight = clampToZero(freeRectangle.height - orientation.height)
      const kerfWidth = Math.min(configuration.kerf, rawLeftoverWidth)
      const kerfHeight = Math.min(configuration.kerf, rawLeftoverHeight)
      const cutWidth = orientation.width + kerfWidth
      const cutHeight = orientation.height + kerfHeight

      const leftoverWidth = clampToZero(freeRectangle.width - cutWidth)
      const leftoverHeight = clampToZero(freeRectangle.height - cutHeight)
      const wasteArea = clampToZero(freeRectangle.width * freeRectangle.height - cutWidth * cutHeight)

      const candidate: PlacementCandidate = {
        freeIndex,
        freeRectangle,
        orientation,
        cutWidth,
        cutHeight,
        leftoverWidth,
        leftoverHeight,
        rawLeftoverWidth,
        rawLeftoverHeight,
        wasteArea,
        score: buildPlacementScore(strategy.placementHeuristic, {
          leftoverWidth,
          leftoverHeight,
          wasteArea,
          freeIndex,
          freeRectangle,
        }),
      }

      if (!bestCandidate) {
        bestCandidate = candidate
        continue
      }

      const scoreComparison = compareScores(candidate.score, bestCandidate.score)

      if (scoreComparison < 0) {
        bestCandidate = candidate
        continue
      }

      if (scoreComparison === 0) {
        const tieBreakComparison = compareScores(
          [candidate.freeRectangle.y, candidate.freeRectangle.x, candidate.cutWidth * candidate.cutHeight],
          [
            bestCandidate.freeRectangle.y,
            bestCandidate.freeRectangle.x,
            bestCandidate.cutWidth * bestCandidate.cutHeight,
          ],
        )

        if (tieBreakComparison < 0) {
          bestCandidate = candidate
        }
      }
    }
  }

  return bestCandidate
}

function placePieceOnSheet(
  piece: Piece,
  freeRectangles: FreeRectangle[],
  strategy: Strategy,
  configuration: PackingConfiguration,
  nextCutOrder: number,
): {
  placement: Placement
  nextFreeRectangles: FreeRectangle[]
  cuts: SheetCut[]
  nextCutOrder: number
} | undefined {
  const candidate = pickPlacementCandidate(piece, freeRectangles, strategy, configuration)

  if (!candidate) {
    return undefined
  }

  const splitOrientation = chooseSplitOrientation(
    strategy.splitHeuristic,
    candidate.freeRectangle,
    candidate.leftoverWidth,
    candidate.leftoverHeight,
  )

  const splitRectangles = splitFreeRectangle(
    candidate.freeRectangle,
    candidate.cutWidth,
    candidate.cutHeight,
    splitOrientation,
  )

  const nextFreeRectangles = pruneFreeRectangles(
    freeRectangles
      .filter((_, index) => index !== candidate.freeIndex)
      .concat(splitRectangles),
  )

  const cutsResult = createGuillotineCuts(
    piece.id,
    candidate.freeRectangle,
    candidate.orientation.width,
    candidate.orientation.height,
    splitOrientation,
    candidate.rawLeftoverWidth,
    candidate.rawLeftoverHeight,
    nextCutOrder,
  )

  return {
    placement: {
      pieceId: piece.id,
      name: piece.name,
      x: candidate.freeRectangle.x,
      y: candidate.freeRectangle.y,
      width: candidate.orientation.width,
      height: candidate.orientation.height,
      rotated: candidate.orientation.rotated,
      cutWidth: candidate.cutWidth,
      cutHeight: candidate.cutHeight,
    },
    nextFreeRectangles,
    cuts: cutsResult.cuts,
    nextCutOrder: cutsResult.nextCutOrder,
  }
}

function canFitOnEmptySheet(piece: Piece, sheet: SheetDefinition, configuration: PackingConfiguration): boolean {
  const orientations = getPieceOrientations(piece, configuration.allowRotation)

  return orientations.some((orientation) => {
    return orientation.width <= sheet.width && orientation.height <= sheet.height
  })
}

function packSingleSheet(
  pieces: Piece[],
  sheet: SheetDefinition,
  strategy: Strategy,
  configuration: PackingConfiguration,
  sheetIndex: number,
): SheetLayout {
  let freeRectangles: FreeRectangle[] = [{ x: 0, y: 0, width: sheet.width, height: sheet.height }]
  const placements: Placement[] = []
  const cuts: SheetCut[] = []
  let nextCutOrder = 1

  let hasPlacementInPass = true

  while (hasPlacementInPass) {
    hasPlacementInPass = false

    for (let pieceIndex = 0; pieceIndex < pieces.length; pieceIndex += 1) {
      const piece = pieces[pieceIndex]
      const placementResult = placePieceOnSheet(piece, freeRectangles, strategy, configuration, nextCutOrder)

      if (!placementResult) {
        continue
      }

      placements.push(placementResult.placement)
      cuts.push(...placementResult.cuts)
      freeRectangles = placementResult.nextFreeRectangles
      nextCutOrder = placementResult.nextCutOrder
      pieces.splice(pieceIndex, 1)
      pieceIndex -= 1
      hasPlacementInPass = true
    }
  }

  const sheetArea = sheet.width * sheet.height
  const usedArea = placements.reduce((sum, placement) => sum + placement.width * placement.height, 0)
  const consumedArea = placements.reduce((sum, placement) => sum + placement.cutWidth * placement.cutHeight, 0)
  const freeArea = Math.max(0, sheetArea - consumedArea)

  return {
    index: sheetIndex,
    width: sheet.width,
    height: sheet.height,
    placements,
    cuts,
    usedArea,
    consumedArea,
    freeArea,
    utilization: sheetArea > 0 ? usedArea / sheetArea : 0,
  }
}

function validateInput(
  rectangleRequests: RectangleRequest[],
  sheet: SheetDefinition,
  configuration: PackingConfiguration,
): void {
  if (sheet.width <= 0 || sheet.height <= 0) {
    throw new Error("Sheet width and height must be positive numbers.")
  }

  if (configuration.kerf < 0) {
    throw new Error("Kerf cannot be negative.")
  }

  rectangleRequests.forEach((rectangle) => {
    if (rectangle.width <= 0 || rectangle.height <= 0) {
      throw new Error(`Rectangle \"${rectangle.name}\" has invalid dimensions.`)
    }

    if (!Number.isInteger(rectangle.quantity) || rectangle.quantity <= 0) {
      throw new Error(`Rectangle \"${rectangle.name}\" has invalid quantity.`)
    }
  })
}

function sortPieces(pieces: Piece[], sortHeuristic: PieceSortHeuristic): Piece[] {
  return [...pieces].sort((left, right) => {
    const leftArea = left.width * left.height
    const rightArea = right.width * right.height

    if (sortHeuristic === "maxSideDesc") {
      const maxSideDiff = Math.max(right.width, right.height) - Math.max(left.width, left.height)

      if (maxSideDiff !== 0) {
        return maxSideDiff
      }
    }

    if (sortHeuristic === "perimeterDesc") {
      const perimeterDiff = 2 * (right.width + right.height) - 2 * (left.width + left.height)

      if (perimeterDiff !== 0) {
        return perimeterDiff
      }
    }

    if (sortHeuristic === "areaDesc") {
      const areaDiff = rightArea - leftArea

      if (areaDiff !== 0) {
        return areaDiff
      }
    }

    const fallbackAreaDiff = rightArea - leftArea

    if (fallbackAreaDiff !== 0) {
      return fallbackAreaDiff
    }

    if (left.name !== right.name) {
      return left.name.localeCompare(right.name)
    }

    return left.id.localeCompare(right.id)
  })
}

export function expandRequests(rectangleRequests: RectangleRequest[]): Piece[] {
  return rectangleRequests.flatMap((rectangle, rectangleIndex) => {
    return Array.from({ length: rectangle.quantity }, (_, itemIndex) => {
      const id = `${rectangleIndex + 1}-${itemIndex + 1}`

      return {
        id,
        name: rectangle.name,
        width: rectangle.width,
        height: rectangle.height,
        canRotate: rectangle.canRotate ?? true,
      }
    })
  })
}

export function packUsingGuillotine(
  rectangleRequests: RectangleRequest[],
  sheet: SheetDefinition,
  configuration: PackingConfiguration,
  strategy: Strategy,
): PackingResult {
  validateInput(rectangleRequests, sheet, configuration)

  const expandedPieces = expandRequests(rectangleRequests)
  const sortedPieces = sortPieces(expandedPieces, strategy.pieceSortHeuristic)
  const remainingPieces = sortedPieces.filter((piece) => canFitOnEmptySheet(piece, sheet, configuration))
  const impossiblePieces = sortedPieces.filter((piece) => !canFitOnEmptySheet(piece, sheet, configuration))

  const sheets: SheetLayout[] = []

  while (remainingPieces.length > 0) {
    const currentSheet = packSingleSheet(remainingPieces, sheet, strategy, configuration, sheets.length + 1)

    if (currentSheet.placements.length === 0) {
      break
    }

    sheets.push(currentSheet)
  }

  const sheetArea = sheet.width * sheet.height
  const totalUsedArea = sheets.reduce((sum, currentSheet) => sum + currentSheet.usedArea, 0)
  const totalConsumedArea = sheets.reduce((sum, currentSheet) => sum + currentSheet.consumedArea, 0)
  const totalFreeArea = sheets.reduce((sum, currentSheet) => sum + currentSheet.freeArea, 0)
  const totalSheetArea = sheets.length * sheetArea
  const unplacedPieces = [...remainingPieces, ...impossiblePieces]

  return {
    strategy,
    configuration,
    sheet,
    sheets,
    unplacedPieces,
    stats: {
      totalRequestedParts: expandedPieces.length,
      placedParts: expandedPieces.length - unplacedPieces.length,
      totalSheets: sheets.length,
      sheetArea,
      totalUsedArea,
      totalConsumedArea,
      totalFreeArea,
      overallUtilization: totalSheetArea > 0 ? totalUsedArea / totalSheetArea : 0,
      kerfWasteArea: Math.max(0, totalConsumedArea - totalUsedArea),
    },
  }
}

import { packUsingGuillotine } from "./guillotine"
import type {
  PackingConfiguration,
  PackingResult,
  RectangleRequest,
  SheetDefinition,
  SolverFlowResult,
  Strategy,
  StrategySummary,
} from "./rectangle.types"

const STRATEGIES: Strategy[] = [
  {
    id: "baf-slas-area",
    placementHeuristic: "bestAreaFit",
    splitHeuristic: "shorterLeftoverAxis",
    pieceSortHeuristic: "areaDesc",
  },
  {
    id: "baf-llas-area",
    placementHeuristic: "bestAreaFit",
    splitHeuristic: "longerLeftoverAxis",
    pieceSortHeuristic: "areaDesc",
  },
  {
    id: "bssf-slas-area",
    placementHeuristic: "bestShortSideFit",
    splitHeuristic: "shorterLeftoverAxis",
    pieceSortHeuristic: "areaDesc",
  },
  {
    id: "bssf-sas-area",
    placementHeuristic: "bestShortSideFit",
    splitHeuristic: "shorterAxis",
    pieceSortHeuristic: "areaDesc",
  },
  {
    id: "blsf-llas-area",
    placementHeuristic: "bestLongSideFit",
    splitHeuristic: "longerLeftoverAxis",
    pieceSortHeuristic: "areaDesc",
  },
  {
    id: "blsf-las-max",
    placementHeuristic: "bestLongSideFit",
    splitHeuristic: "longerAxis",
    pieceSortHeuristic: "maxSideDesc",
  },
  {
    id: "firstfit-slas-area",
    placementHeuristic: "firstFit",
    splitHeuristic: "shorterLeftoverAxis",
    pieceSortHeuristic: "areaDesc",
  },
  {
    id: "baf-minas-perimeter",
    placementHeuristic: "bestAreaFit",
    splitHeuristic: "minimizeAreaSplit",
    pieceSortHeuristic: "perimeterDesc",
  },
]

function summarize(result: PackingResult): StrategySummary {
  return {
    strategyId: result.strategy.id,
    totalSheets: result.stats.totalSheets,
    unplacedCount: result.unplacedPieces.length,
    utilization: result.stats.overallUtilization,
    totalFreeArea: result.stats.totalFreeArea,
    kerfWasteArea: result.stats.kerfWasteArea,
  }
}

function compareResults(left: PackingResult, right: PackingResult): number {
  if (left.unplacedPieces.length !== right.unplacedPieces.length) {
    return left.unplacedPieces.length - right.unplacedPieces.length
  }

  if (left.stats.totalSheets !== right.stats.totalSheets) {
    return left.stats.totalSheets - right.stats.totalSheets
  }

  if (left.stats.totalFreeArea !== right.stats.totalFreeArea) {
    return left.stats.totalFreeArea - right.stats.totalFreeArea
  }

  if (left.stats.kerfWasteArea !== right.stats.kerfWasteArea) {
    return left.stats.kerfWasteArea - right.stats.kerfWasteArea
  }

  if (left.stats.overallUtilization !== right.stats.overallUtilization) {
    return right.stats.overallUtilization - left.stats.overallUtilization
  }

  return left.strategy.id.localeCompare(right.strategy.id)
}

function buildSolverFlowResult(
  rectangles: RectangleRequest[],
  sheet: SheetDefinition,
  configuration: PackingConfiguration,
  allResults: PackingResult[],
): SolverFlowResult {
  const sortedResults = [...allResults].sort(compareResults)
  const bestResult = sortedResults[0]

  return {
    generatedAt: new Date().toISOString(),
    input: {
      rectangles,
      sheet,
      configuration,
    },
    bestResult,
    strategySummaries: sortedResults.map(summarize),
  }
}

export function solveWithStrategyFlow(
  rectangles: RectangleRequest[],
  sheet: SheetDefinition,
  configuration: PackingConfiguration,
): SolverFlowResult {
  const allResults = STRATEGIES.map((strategy) => {
    return packUsingGuillotine(rectangles, sheet, configuration, strategy)
  })

  return buildSolverFlowResult(rectangles, sheet, configuration, allResults)
}

export async function solveWithStrategyFlowProgress(
  rectangles: RectangleRequest[],
  sheet: SheetDefinition,
  configuration: PackingConfiguration,
  onProgress: (progress: { currentStep: number; totalSteps: number; strategyId: string }) => void,
): Promise<SolverFlowResult> {
  const totalSteps = STRATEGIES.length
  const allResults: PackingResult[] = []

  for (let index = 0; index < STRATEGIES.length; index += 1) {
    const strategy = STRATEGIES[index]
    const currentStep = index + 1

    onProgress({
      currentStep,
      totalSteps,
      strategyId: strategy.id,
    })

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 0)
    })

    allResults.push(packUsingGuillotine(rectangles, sheet, configuration, strategy))
  }

  return buildSolverFlowResult(rectangles, sheet, configuration, allResults)
}

export const defaultStrategies = STRATEGIES

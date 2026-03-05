"use client"

import { Card, CardContent, CardHeader } from "@heroui/react"
import { useEffect, useMemo, useState } from "react"
import { SheetsSection } from "@/components/rectangle/sheets-section"
import { SolverLoadingCard } from "@/components/rectangle/solver-loading-card"
import { formatNumber, formatPercent } from "@/components/rectangle/number-format"
import { UnplacedCard } from "@/components/rectangle/unplaced-card"
import { type RectangleViewMode, ViewSwitch } from "@/components/rectangle/view-switch"
import { mockupConfiguration, mockupRectangles, mockupSheet } from "@/services/rectangle/mockup"
import { defaultStrategies, solveWithStrategyFlowProgress } from "@/services/rectangle/solver"
import type { SolverFlowResult } from "@/services/rectangle/types"

interface CalculationProgress {
  currentStep: number
  totalSteps: number
  strategyId: string
}

export default function RectangleClient() {
  const [viewMode, setViewMode] = useState<RectangleViewMode>("advanced")
  const [result, setResult] = useState<SolverFlowResult | null>(null)
  const [progress, setProgress] = useState<CalculationProgress>({
    currentStep: 0,
    totalSteps: defaultStrategies.length,
    strategyId: "",
  })

  useEffect(() => {
    let isCancelled = false

    const runSolver = async () => {
      setResult(null)
      setProgress({
        currentStep: 0,
        totalSteps: defaultStrategies.length,
        strategyId: "",
      })

      const nextResult = await solveWithStrategyFlowProgress(
        mockupRectangles,
        mockupSheet,
        mockupConfiguration,
        (nextProgress) => {
          if (isCancelled) {
            return
          }

          setProgress(nextProgress)
        },
      )

      if (isCancelled) {
        return
      }

      setResult(nextResult)
    }

    void runSolver()

    return () => {
      isCancelled = true
    }
  }, [])

  const progressPercent =
    progress.totalSteps > 0 ? Math.min(100, (progress.currentStep / progress.totalSteps) * 100) : 0
  const serializedOutput = useMemo(() => {
    if (!result) {
      return ""
    }

    return JSON.stringify(result, null, 2)
  }, [result])

  if (!result) {
    return (
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
        <ViewSwitch viewMode={viewMode} onChange={setViewMode} />
        <SolverLoadingCard
          currentStep={progress.currentStep}
          progressPercent={progressPercent}
          strategyId={progress.strategyId}
          totalSteps={progress.totalSteps}
        />
      </main>
    )
  }

  const { bestResult, strategySummaries, generatedAt } = result

  const unplacedBySize = bestResult.unplacedPieces.reduce<Record<string, { label: string; count: number }>>(
    (accumulator, piece) => {
      const key = `${piece.name}|${formatNumber(piece.width)}|${formatNumber(piece.height)}`

      if (!accumulator[key]) {
        accumulator[key] = {
          label: `${piece.name} (${formatNumber(piece.width)} x ${formatNumber(piece.height)} mm)`,
          count: 0,
        }
      }

      accumulator[key].count += 1
      return accumulator
    },
    {},
  )

  const unplacedSizeEntries = Object.entries(unplacedBySize)
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, value]) => ({ key, ...value }))

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      <ViewSwitch viewMode={viewMode} onChange={setViewMode} />

      {viewMode === "simple" ? (
        <>
          <Card>
            <CardHeader className="flex flex-col items-start gap-2">
              <h1 className="text-2xl font-semibold">Rectangle Solver Mockup</h1>
              <p className="text-sm text-neutral-500">Generated at: {generatedAt}</p>
            </CardHeader>
            <CardContent className="text-sm">
              <p>Total sheets: {bestResult.stats.totalSheets}</p>
            </CardContent>
          </Card>

          <UnplacedCard entries={unplacedSizeEntries} />

          <SheetsSection sheets={bestResult.sheets} simpleView />
        </>
      ) : (
        <>
          <Card>
            <CardHeader className="flex flex-col items-start gap-2">
              <h1 className="text-2xl font-semibold">Rectangle Solver Mockup</h1>
              <p className="text-sm text-neutral-500">Generated at: {generatedAt}</p>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <p>Best strategy: {bestResult.strategy.id}</p>
              <p>Total sheets: {bestResult.stats.totalSheets}</p>
              <p>Total cuts: {bestResult.sheets.reduce((sum, sheet) => sum + sheet.cuts.length, 0)}</p>
              <p>Placed parts: {bestResult.stats.placedParts}</p>
              <p>Unplaced parts: {bestResult.unplacedPieces.length}</p>
              <p>Overall utilization: {formatPercent(bestResult.stats.overallUtilization)}</p>
              <p>Kerf waste area: {formatNumber(bestResult.stats.kerfWasteArea)} mm²</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Strategy Ranking</h2>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-neutral-300">
                      <th className="px-2 py-2">Strategy</th>
                      <th className="px-2 py-2">Sheets</th>
                      <th className="px-2 py-2">Unplaced</th>
                      <th className="px-2 py-2">Utilization</th>
                    </tr>
                  </thead>
                  <tbody>
                    {strategySummaries.map((summary) => (
                      <tr key={summary.strategyId} className="border-b border-neutral-200">
                        <td className="px-2 py-2">{summary.strategyId}</td>
                        <td className="px-2 py-2">{summary.totalSheets}</td>
                        <td className="px-2 py-2">{summary.unplacedCount}</td>
                        <td className="px-2 py-2">{formatPercent(summary.utilization)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <UnplacedCard entries={unplacedSizeEntries} />

          <SheetsSection sheets={bestResult.sheets} simpleView={false} />

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Output JSON</h2>
            </CardHeader>
            <CardContent>
              <pre className="max-h-[28rem] overflow-auto rounded-md border border-neutral-300 bg-neutral-50 p-4 text-xs text-black">
                {serializedOutput}
              </pre>
            </CardContent>
          </Card>
        </>
      )}
    </main>
  )
}

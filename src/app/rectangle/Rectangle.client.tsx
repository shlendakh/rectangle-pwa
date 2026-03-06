"use client"

import { Accordion, Button, Card, CardContent, CardHeader } from "@heroui/react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { RectangleToolbar } from "@/components/rectangle/RectangleToolbar"
import { SheetsSection } from "@/components/rectangle/SheetsSection"
import { SolverLoadingCard } from "@/components/rectangle/SolverLoadingCard"
import { formatNumber, formatPercent } from "@/components/rectangle/number-format"
import { UnplacedCard } from "@/components/rectangle/UnplacedCard"
import type { RectangleViewMode } from "@/components/rectangle/ViewSwitch"
import { formatDateTime } from "@/services/date/date-format"
import {
  clearSelectedHistoryEntryId,
  loadCutHistoryEntryById,
  loadSelectedHistoryEntryId,
  saveCutHistoryEntry,
} from "@/services/rectangle/cut-history"
import { loadImportedRectangleData } from "@/services/rectangle/session-input"
import {
  buildUnplacedSizeEntries,
  calculateProgressPercent,
  countTotalCuts,
} from "@/services/rectangle/rectangle-view"
import { defaultStrategies, solveWithStrategyFlowProgress } from "@/services/rectangle/solver"
import type { ImportedRectangleData, SolverFlowResult } from "@/services/rectangle/rectangle.types"

interface CalculationProgress {
  currentStep: number
  totalSteps: number
  strategyId: string
}

export default function RectangleClient() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<RectangleViewMode>("advanced")
  const [importedData, setImportedData] = useState<ImportedRectangleData | null>(null)
  const [missingDataMessage, setMissingDataMessage] = useState<string | null>(null)
  const [result, setResult] = useState<SolverFlowResult | null>(null)
  const [isResultLoadedFromHistory, setIsResultLoadedFromHistory] = useState(false)
  const [progress, setProgress] = useState<CalculationProgress>({
    currentStep: 0,
    totalSteps: defaultStrategies.length,
    strategyId: "",
  })

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const loadedData = loadImportedRectangleData()
      const selectedHistoryEntryId = loadSelectedHistoryEntryId()

      if (selectedHistoryEntryId) {
        const historyEntry = loadCutHistoryEntryById(selectedHistoryEntryId)

        if (
          historyEntry &&
          loadedData &&
          historyEntry.importedData.importedAt === loadedData.importedAt &&
          historyEntry.importedData.sourceFileName === loadedData.sourceFileName
        ) {
          clearSelectedHistoryEntryId()
          setImportedData(historyEntry.importedData)
          setResult(historyEntry.result)
          setMissingDataMessage(null)
          setIsResultLoadedFromHistory(true)
          return
        }

        clearSelectedHistoryEntryId()
      }

      if (!loadedData) {
        setMissingDataMessage("No imported CSV data found. Go back to home page and import a file.")
        return
      }

      setMissingDataMessage(null)
      setImportedData(loadedData)
      setIsResultLoadedFromHistory(false)
      setResult(null)
    }, 0)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [])

  useEffect(() => {
    if (!importedData || isResultLoadedFromHistory) {
      return
    }

    let isCancelled = false

    const runSolver = async () => {
      setResult(null)
      setProgress({
        currentStep: 0,
        totalSteps: defaultStrategies.length,
        strategyId: "",
      })

      const nextResult = await solveWithStrategyFlowProgress(
        importedData.rectangles,
        importedData.sheet,
        importedData.configuration,
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

      try {
        saveCutHistoryEntry({
          importedData,
          result: nextResult,
        })
      } catch {
        // History persistence failure should not block viewing results.
      }
    }

    void runSolver()

    return () => {
      isCancelled = true
    }
  }, [importedData, isResultLoadedFromHistory])

  const progressPercent = calculateProgressPercent(progress.currentStep, progress.totalSteps)
  const serializedOutput = useMemo(() => {
    if (!result) {
      return ""
    }

    return JSON.stringify(result, null, 2)
  }, [result])

  let content: React.ReactNode

  if (missingDataMessage) {
    content = (
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold">Rectangle Solver</h1>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-600">{missingDataMessage}</p>
        </CardContent>
      </Card>
    )
  } else if (!result) {
    content = (
      <SolverLoadingCard
        currentStep={progress.currentStep}
        progressPercent={progressPercent}
        strategyId={progress.strategyId}
        totalSteps={progress.totalSteps}
      />
    )
  } else {
    const { bestResult, strategySummaries, generatedAt } = result
    const unplacedSizeEntries = buildUnplacedSizeEntries(bestResult.unplacedPieces)

    content =
      viewMode === "simple" ? (
        <>
          <Card>
            <CardHeader className="flex flex-col items-start gap-2">
              <h1 className="text-2xl font-semibold">Rectangle Solver</h1>
              <p className="text-sm text-neutral-500">Source: {importedData?.sourceFileName}</p>
              {isResultLoadedFromHistory && (
                <p className="text-sm text-neutral-500">Loaded from saved history.</p>
              )}
              <p className="text-sm text-neutral-500">
                Sheet: {formatNumber(importedData?.sheet.width ?? 0)} x{" "}
                {formatNumber(importedData?.sheet.height ?? 0)} mm, Kerf:{" "}
                {formatNumber(importedData?.configuration.kerf ?? 0)} mm
              </p>
              <p className="text-sm text-neutral-500">
                Generated at: {formatDateTime(generatedAt)}
              </p>
              <p className="text-xs text-neutral-500">
                This result is stored locally on this device in browser storage.
              </p>
            </CardHeader>
            <CardContent className="text-sm">
              <p>Total sheets: {bestResult.stats.totalSheets}</p>
            </CardContent>
          </Card>

          <UnplacedCard entries={unplacedSizeEntries} />

          <SheetsSection sheets={bestResult.sheets} simpleView sheetInfo={importedData?.sheet} />
        </>
      ) : (
        <>
          <Card>
            <CardHeader className="flex flex-col items-start gap-2">
              <h1 className="text-2xl font-semibold">Rectangle Solver</h1>
              <p className="text-sm text-neutral-500">Source: {importedData?.sourceFileName}</p>
              {isResultLoadedFromHistory && (
                <p className="text-sm text-neutral-500">Loaded from saved history.</p>
              )}
              <p className="text-sm text-neutral-500">
                Sheet: {formatNumber(importedData?.sheet.width ?? 0)} x{" "}
                {formatNumber(importedData?.sheet.height ?? 0)} mm, Kerf:{" "}
                {formatNumber(importedData?.configuration.kerf ?? 0)} mm
              </p>
              <p className="text-sm text-neutral-500">
                Generated at: {formatDateTime(generatedAt)}
              </p>
              <p className="text-xs text-neutral-500">
                This result is stored locally on this device in browser storage.
              </p>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <p>Best strategy: {bestResult.strategy.id}</p>
              <p>Total sheets: {bestResult.stats.totalSheets}</p>
              <p>Total cuts: {countTotalCuts(bestResult.sheets)}</p>
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

          <SheetsSection
            sheets={bestResult.sheets}
            simpleView={false}
            sheetInfo={importedData?.sheet}
          />

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Output JSON</h2>
            </CardHeader>
            <CardContent>
              <Accordion>
                <Accordion.Item id="output-json">
                  <Accordion.Heading>
                    <Accordion.Trigger>Show Output JSON</Accordion.Trigger>
                  </Accordion.Heading>
                  <Accordion.Panel>
                    <Accordion.Body>
                      <pre className="max-h-112 overflow-auto rounded-md border border-neutral-300 bg-neutral-50 p-4 text-xs text-black">
                        {serializedOutput}
                      </pre>
                    </Accordion.Body>
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            </CardContent>
          </Card>
        </>
      )
  }

  return (
    <>
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6 pb-32 md:pb-28">
        <RectangleToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onBack={() => {
            router.push("/")
          }}
        />
        {content}
      </main>

      <div className="border-border fixed right-0 bottom-0 left-0 z-40 border-t bg-(--background)/95 backdrop-blur md:border-none md:bg-transparent md:backdrop-blur-none">
        <div
          className="mx-auto flex w-full max-w-7xl justify-center px-4 pt-2 md:pointer-events-none md:pt-0"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex w-full gap-2 pb-3 md:pointer-events-auto md:max-w-md md:pb-4">
            <Button
              className="flex-1"
              onPress={() => {
                // TODO - implement PDF export
              }}
              variant="primary"
              size="lg"
            >
              Export PDF
            </Button>
            <Button
              className="flex-1"
              onPress={() => {
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                })
              }}
              variant="secondary"
              size="lg"
            >
              Back to Top
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

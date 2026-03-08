import { storedCutHistorySchema } from "./rectangle.schema"
import type { CutHistoryEntry, ImportedRectangleData, SolverFlowResult } from "./rectangle.types"

const HISTORY_STORAGE_KEY = "cutstack-planner:history"
const ACTIVE_HISTORY_ENTRY_ID_KEY = "cutstack-planner:active-history-entry-id"

function canUseWindow(): boolean {
  return typeof window !== "undefined"
}

function createHistoryEntryId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`
}

function writeHistory(historyEntries: CutHistoryEntry[]): void {
  if (!canUseWindow()) {
    return
  }

  window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historyEntries))
}

export function loadCutHistory(): CutHistoryEntry[] {
  if (!canUseWindow()) {
    return []
  }

  const rawValue = window.localStorage.getItem(HISTORY_STORAGE_KEY)

  if (!rawValue) {
    return []
  }

  let parsedJson: unknown

  try {
    parsedJson = JSON.parse(rawValue)
  } catch {
    window.localStorage.removeItem(HISTORY_STORAGE_KEY)
    return []
  }

  const parsedHistory = storedCutHistorySchema.safeParse(parsedJson)

  if (!parsedHistory.success) {
    window.localStorage.removeItem(HISTORY_STORAGE_KEY)
    return []
  }

  return parsedHistory.data
}

export function saveCutHistoryEntry(payload: {
  importedData: ImportedRectangleData
  result: SolverFlowResult
}): CutHistoryEntry {
  const nextEntry: CutHistoryEntry = {
    id: createHistoryEntryId(),
    sourceFileName: payload.importedData.sourceFileName,
    generatedAt: payload.result.generatedAt,
    importedData: payload.importedData,
    result: payload.result,
  }

  if (!canUseWindow()) {
    return nextEntry
  }

  const currentHistory = loadCutHistory()
  writeHistory([nextEntry, ...currentHistory])

  return nextEntry
}

export function loadCutHistoryEntryById(entryId: string): CutHistoryEntry | null {
  const historyEntries = loadCutHistory()
  const matchingEntry = historyEntries.find((entry) => entry.id === entryId)
  return matchingEntry ?? null
}

export function removeCutHistoryEntries(entryIds: string[]): void {
  if (!canUseWindow() || entryIds.length === 0) {
    return
  }

  const idsToRemove = new Set(entryIds)
  const currentHistory = loadCutHistory()
  const nextHistory = currentHistory.filter((entry) => !idsToRemove.has(entry.id))

  writeHistory(nextHistory)

  const activeEntryId = loadSelectedHistoryEntryId()

  if (activeEntryId && idsToRemove.has(activeEntryId)) {
    clearSelectedHistoryEntryId()
  }
}

export function clearCutHistory(): void {
  if (!canUseWindow()) {
    return
  }

  window.localStorage.removeItem(HISTORY_STORAGE_KEY)
  clearSelectedHistoryEntryId()
}

export function saveSelectedHistoryEntryId(entryId: string): void {
  if (!canUseWindow()) {
    return
  }

  window.sessionStorage.setItem(ACTIVE_HISTORY_ENTRY_ID_KEY, entryId)
}

export function loadSelectedHistoryEntryId(): string | null {
  if (!canUseWindow()) {
    return null
  }

  const rawValue = window.sessionStorage.getItem(ACTIVE_HISTORY_ENTRY_ID_KEY)

  if (!rawValue) {
    return null
  }

  return rawValue.trim().length > 0 ? rawValue : null
}

export function clearSelectedHistoryEntryId(): void {
  if (!canUseWindow()) {
    return
  }

  window.sessionStorage.removeItem(ACTIVE_HISTORY_ENTRY_ID_KEY)
}

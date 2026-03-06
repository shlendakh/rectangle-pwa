"use client"

import { Alert } from "@heroui/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  clearCutHistory,
  loadCutHistory,
  loadCutHistoryEntryById,
  removeCutHistoryEntries,
  saveSelectedHistoryEntryId,
} from "@/services/rectangle/cut-history"
import type { CutHistoryEntry } from "@/services/rectangle/rectangle.types"
import { saveImportedRectangleData } from "@/services/rectangle/session-input"
import { CutHistoryCard } from "./CutHistoryCard"

export function CutHistorySection() {
  const router = useRouter()
  const [historyEntries, setHistoryEntries] = useState<CutHistoryEntry[]>(() => loadCutHistory())
  const [selectedHistoryEntryIds, setSelectedHistoryEntryIds] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const replaceHistoryEntries = (nextHistoryEntries: CutHistoryEntry[]) => {
    setHistoryEntries(nextHistoryEntries)
    setSelectedHistoryEntryIds((previousIds) => {
      const availableIds = new Set(nextHistoryEntries.map((entry) => entry.id))
      return previousIds.filter((entryId) => availableIds.has(entryId))
    })
  }

  const hasHistoryEntries = historyEntries.length > 0
  const canDeleteSelectedHistoryEntries = selectedHistoryEntryIds.length > 0

  const reloadHistoryEntries = () => {
    replaceHistoryEntries(loadCutHistory())
  }

  const toggleHistorySelection = (entryId: string, isSelected: boolean) => {
    setSelectedHistoryEntryIds((previousIds) => {
      if (isSelected) {
        if (previousIds.includes(entryId)) {
          return previousIds
        }

        return [...previousIds, entryId]
      }

      return previousIds.filter((id) => id !== entryId)
    })
  }

  const deleteSelectedHistoryEntries = () => {
    if (!canDeleteSelectedHistoryEntries) {
      return
    }

    if (
      typeof window !== "undefined" &&
      !window.confirm(`Delete ${selectedHistoryEntryIds.length} selected history entr${selectedHistoryEntryIds.length === 1 ? "y" : "ies"}?`)
    ) {
      return
    }

    removeCutHistoryEntries(selectedHistoryEntryIds)
    setSelectedHistoryEntryIds([])
    setError(null)
    reloadHistoryEntries()
  }

  const deleteAllHistoryEntries = () => {
    if (!hasHistoryEntries) {
      return
    }

    if (typeof window !== "undefined" && !window.confirm("Delete all saved cuts from history?")) {
      return
    }

    clearCutHistory()
    setSelectedHistoryEntryIds([])
    setError(null)
    reloadHistoryEntries()
  }

  const openHistoryEntry = (entryId: string) => {
    const entry = loadCutHistoryEntryById(entryId)

    if (!entry) {
      reloadHistoryEntries()
      setError("Selected history entry was not found.")
      return
    }

    setError(null)
    saveImportedRectangleData(entry.importedData)
    saveSelectedHistoryEntryId(entry.id)
    router.push("/rectangle")
  }

  if (!hasHistoryEntries && !error) {
    return null
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      {hasHistoryEntries && (
        <CutHistoryCard
          historyEntries={historyEntries}
          onDeleteAllHistoryEntries={deleteAllHistoryEntries}
          onDeleteSelectedHistoryEntries={deleteSelectedHistoryEntries}
          onOpenHistoryEntry={openHistoryEntry}
          onToggleHistorySelection={toggleHistorySelection}
          selectedHistoryEntryIds={selectedHistoryEntryIds}
        />
      )}
    </div>
  )
}

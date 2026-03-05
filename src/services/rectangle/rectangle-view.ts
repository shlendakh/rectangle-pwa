import type { Piece } from "./rectangle.types"

export interface UnplacedSizeEntry {
  key: string
  label: string
  count: number
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? value.toString() : value.toFixed(2)
}

export function calculateProgressPercent(currentStep: number, totalSteps: number): number {
  if (totalSteps <= 0) {
    return 0
  }

  return Math.min(100, (currentStep / totalSteps) * 100)
}

export function buildUnplacedSizeEntries(unplacedPieces: Piece[]): UnplacedSizeEntry[] {
  const unplacedBySize = unplacedPieces.reduce<Record<string, UnplacedSizeEntry>>((accumulator, piece) => {
    const key = `${piece.name}|${formatNumber(piece.width)}|${formatNumber(piece.height)}`

    if (!accumulator[key]) {
      accumulator[key] = {
        key,
        label: `${piece.name} (${formatNumber(piece.width)} x ${formatNumber(piece.height)} mm)`,
        count: 0,
      }
    }

    accumulator[key].count += 1
    return accumulator
  }, {})

  return Object.values(unplacedBySize).sort((left, right) => left.key.localeCompare(right.key))
}

export function countTotalCuts(cutsBySheet: { cuts: Array<unknown> }[]): number {
  return cutsBySheet.reduce((sum, sheet) => sum + sheet.cuts.length, 0)
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`
}

export function formatNumber(value: number): string {
  return Number.isInteger(value) ? value.toString() : value.toFixed(2)
}

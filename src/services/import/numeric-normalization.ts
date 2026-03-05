export function normalizeNumericString(value: string): string {
  const cleaned = value.trim().replace(/\u00a0/g, "").replace(/\s+/g, "").replace(/'/g, "")
  const lastCommaIndex = cleaned.lastIndexOf(",")
  const lastDotIndex = cleaned.lastIndexOf(".")

  if (lastCommaIndex !== -1 && lastDotIndex !== -1) {
    if (lastCommaIndex > lastDotIndex) {
      return cleaned.replace(/\./g, "").replace(",", ".")
    }

    return cleaned.replace(/,/g, "")
  }

  if (lastCommaIndex !== -1) {
    return cleaned.replace(",", ".")
  }

  return cleaned
}

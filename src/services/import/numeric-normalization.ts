export function normalizeNumericString(value: string): string {
  const cleaned = value
    .trim()
    .replace(/^\ufeff/, "")
    .replace(/\u00a0/g, "")
    .replace(/\s+/g, "")
    .replace(/'/g, "")
    .replace(/"/g, "")

  const lastCommaIndex = cleaned.lastIndexOf(",")
  const lastDotIndex = cleaned.lastIndexOf(".")

  if (lastCommaIndex !== -1 && lastDotIndex !== -1) {
    if (lastCommaIndex > lastDotIndex) {
      return cleaned.replace(/\./g, "").replace(",", ".")
    }

    return cleaned.replace(/,/g, "")
  }

  if (lastCommaIndex !== -1) {
    const commaCount = cleaned.split(",").length - 1

    if (commaCount > 1) {
      return cleaned.replace(/,/g, "")
    }

    return cleaned.replace(",", ".")
  }

  if (lastDotIndex !== -1) {
    const dotCount = cleaned.split(".").length - 1

    if (dotCount > 1) {
      return cleaned.replace(/\./g, "")
    }
  }

  return cleaned
}

import { format, isValid, parseISO } from "date-fns"

export function formatDateTime(value: string): string {
  const parsedDate = parseISO(value)

  if (!isValid(parsedDate)) {
    return value
  }

  return format(parsedDate, "yyyy-MM-dd HH:mm")
}

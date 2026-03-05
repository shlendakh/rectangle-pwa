import { Card, CardContent, CardHeader } from "@heroui/react"

export interface UnplacedEntry {
  key: string
  label: string
  count: number
}

interface UnplacedCardProps {
  entries: UnplacedEntry[]
}

export function UnplacedCard({ entries }: UnplacedCardProps) {
  if (entries.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">Unplaced</h2>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-5 text-sm">
          {entries.map((entry) => (
            <li key={entry.key}>
              {entry.label} - qty: {entry.count}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

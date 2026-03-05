import { Card, CardContent, CardHeader } from "@heroui/react"
import type { UnplacedSizeEntry } from "@/services/rectangle/rectangle-view"

interface UnplacedCardProps {
  entries: UnplacedSizeEntry[]
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

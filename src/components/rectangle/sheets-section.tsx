import { Card, CardContent, CardHeader } from "@heroui/react"
import type { SheetLayout } from "@/services/rectangle/types"
import { formatPercent } from "./number-format"
import { SheetSvg } from "./sheet-svg"

interface SheetsSectionProps {
  sheets: SheetLayout[]
  simpleView: boolean
}

export function SheetsSection({ sheets, simpleView }: SheetsSectionProps) {
  return (
    <section className="grid grid-cols-1 gap-6">
      {sheets.map((sheet) => (
        <Card key={sheet.index}>
          <CardHeader className="flex flex-col items-start gap-1">
            <h3 className="text-lg font-semibold">Sheet {sheet.index}</h3>
            {!simpleView && <p className="text-sm text-neutral-500">Utilization: {formatPercent(sheet.utilization)}</p>}
            {!simpleView && <p className="text-sm text-neutral-500">Guillotine cuts: {sheet.cuts.length}</p>}
          </CardHeader>
          <CardContent className="gap-4">
            <SheetSvg sheet={sheet} />
          </CardContent>
        </Card>
      ))}
    </section>
  )
}

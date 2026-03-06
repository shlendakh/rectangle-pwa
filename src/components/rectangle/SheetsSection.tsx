import { Card, CardContent, CardHeader } from "@heroui/react"
import type { SheetDefinition, SheetLayout } from "@/services/rectangle/rectangle.types"
import { formatNumber, formatPercent } from "./number-format"
import { SheetSvg } from "./SheetSvg"

interface SheetsSectionProps {
  sheets: SheetLayout[]
  simpleView: boolean
  sheetInfo?: SheetDefinition
}

export function SheetsSection({ sheets, simpleView, sheetInfo }: SheetsSectionProps) {
  return (
    <section className="grid grid-cols-1 gap-6">
      {sheets.map((sheet) => (
        <Card key={sheet.index}>
          <CardHeader className="flex flex-col items-start gap-1">
            <h3 className="text-lg font-semibold">{`Sheet ${sheet.index} ${sheetInfo ? `(${formatNumber(sheetInfo.width)} x ${formatNumber(sheetInfo.height)} mm)` : ""}`}</h3>
            {!simpleView && (
              <p className="text-sm text-neutral-500">
                Utilization: {formatPercent(sheet.utilization)}
              </p>
            )}
            {!simpleView && (
              <p className="text-sm text-neutral-500">Guillotine cuts: {sheet.cuts.length}</p>
            )}
          </CardHeader>
          <CardContent className="gap-4">
            <SheetSvg sheet={sheet} />
          </CardContent>
        </Card>
      ))}
    </section>
  )
}

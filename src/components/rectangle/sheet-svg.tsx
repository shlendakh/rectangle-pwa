import type { SheetLayout } from "@/services/rectangle/types"
import { formatNumber } from "./number-format"

interface CutMarker {
  cutId: string
  order: number
  x: number
  y: number
  color: string
}

interface RectangleLabelLayout {
  label: string
  dimensions: string
  x: number
  y: number
  fontSize: number
  dimensionSize: number
  offset: number
  rotate: boolean
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function trimWithEllipsis(value: string, maxChars: number): string {
  if (maxChars <= 0) {
    return ""
  }

  if (value.length <= maxChars) {
    return value
  }

  if (maxChars === 1) {
    return "…"
  }

  return `${value.slice(0, maxChars - 1)}…`
}

function computeRectangleLabelLayout(
  placement: SheetLayout["placements"][number],
  name: string,
  dimensions: string,
): RectangleLabelLayout {
  const longerSide = Math.max(placement.width, placement.height)
  const shorterSide = Math.max(1, Math.min(placement.width, placement.height))
  const rotate = placement.height > placement.width

  const fontSize = Math.max(11, Math.min(26, Math.floor(shorterSide * 0.18), Math.floor(longerSide * 0.075)))
  const dimensionSize = Math.max(10, Math.min(20, Math.floor(fontSize * 0.78)))
  const labelCharEstimate = Math.max(4, Math.floor((longerSide - 16) / Math.max(1, fontSize * 0.58)))
  const dimensionCharEstimate = Math.max(6, Math.floor((longerSide - 16) / Math.max(1, dimensionSize * 0.56)))

  return {
    label: trimWithEllipsis(name, labelCharEstimate),
    dimensions: trimWithEllipsis(dimensions, dimensionCharEstimate),
    x: placement.x + placement.width / 2,
    y: placement.y + placement.height / 2,
    fontSize,
    dimensionSize,
    offset: Math.max(6, Math.floor(fontSize * 0.45)),
    rotate,
  }
}

function computeCutMarkers(sheet: SheetLayout, markerRadius: number): CutMarker[] {
  const minCenterDistance = markerRadius * 2.2
  const offsetStep = markerRadius * 1.5
  const minX = markerRadius + 2
  const maxX = sheet.width - markerRadius - 2
  const minY = markerRadius + 2
  const maxY = sheet.height - markerRadius - 2
  const candidateAxisSteps = [0, 1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6]

  const markers: CutMarker[] = []

  for (const cut of sheet.cuts) {
    const baseX = (cut.x1 + cut.x2) / 2
    const baseY = (cut.y1 + cut.y2) / 2
    const color = cut.orientation === "horizontal" ? "#2563eb" : "#ef4444"
    const lineMinX = Math.min(cut.x1, cut.x2)
    const lineMaxX = Math.max(cut.x1, cut.x2)
    const lineMinY = Math.min(cut.y1, cut.y2)
    const lineMaxY = Math.max(cut.y1, cut.y2)
    const axisMinX = clamp(lineMinX + markerRadius, minX, maxX)
    const axisMaxX = clamp(lineMaxX - markerRadius, minX, maxX)
    const axisMinY = clamp(lineMinY + markerRadius, minY, maxY)
    const axisMaxY = clamp(lineMaxY - markerRadius, minY, maxY)
    const hasHorizontalAxisRoom = axisMinX <= axisMaxX
    const hasVerticalAxisRoom = axisMinY <= axisMaxY

    let markerX = clamp(baseX, minX, maxX)
    let markerY = clamp(baseY, minY, maxY)

    for (const step of candidateAxisSteps) {
      const candidateX =
        cut.orientation === "horizontal"
          ? clamp(
              baseX + step * offsetStep,
              hasHorizontalAxisRoom ? axisMinX : markerX,
              hasHorizontalAxisRoom ? axisMaxX : markerX,
            )
          : clamp(baseX, minX, maxX)
      const candidateY =
        cut.orientation === "vertical"
          ? clamp(
              baseY + step * offsetStep,
              hasVerticalAxisRoom ? axisMinY : markerY,
              hasVerticalAxisRoom ? axisMaxY : markerY,
            )
          : clamp(baseY, minY, maxY)

      const overlapsExisting = markers.some((existingMarker) => {
        const dx = existingMarker.x - candidateX
        const dy = existingMarker.y - candidateY
        return Math.hypot(dx, dy) < minCenterDistance
      })

      if (!overlapsExisting) {
        markerX = candidateX
        markerY = candidateY
        break
      }
    }

    markers.push({
      cutId: cut.id,
      order: cut.order,
      x: markerX,
      y: markerY,
      color,
    })
  }

  return markers
}

interface SheetSvgProps {
  sheet: SheetLayout
}

export function SheetSvg({ sheet }: SheetSvgProps) {
  const baseSheetTextSize = Math.max(14, Math.floor(Math.min(sheet.width, sheet.height) / 28))
  const cutLabelSize = Math.max(20, Math.floor(baseSheetTextSize * 1.25))
  const cutMarkers = computeCutMarkers(sheet, cutLabelSize)

  return (
    <svg
      aria-label={`Cut schema for sheet ${sheet.index}`}
      className="h-auto w-full rounded-md border border-neutral-300 bg-white"
      role="img"
      viewBox={`0 0 ${sheet.width} ${sheet.height}`}
    >
      <rect x={0} y={0} width={sheet.width} height={sheet.height} fill="white" stroke="#171717" strokeWidth={2} />
      {sheet.placements.map((placement) => {
        const name = `${placement.name}${placement.rotated ? " (R)" : ""}`
        const dimensionsLabel = `${formatNumber(placement.width)} x ${formatNumber(placement.height)} mm`
        const labelLayout = computeRectangleLabelLayout(placement, name, dimensionsLabel)

        return (
          <g key={placement.pieceId}>
            <rect
              x={placement.x}
              y={placement.y}
              width={placement.cutWidth}
              height={placement.cutHeight}
              fill="none"
              stroke="#6b7280"
              strokeDasharray="16 10"
              strokeWidth={2}
            />
            <rect
              x={placement.x}
              y={placement.y}
              width={placement.width}
              height={placement.height}
              fill="rgba(16, 185, 129, 0.25)"
              stroke="#10b981"
              strokeWidth={3}
            />
            <text
              x={labelLayout.x}
              y={labelLayout.y}
              dominantBaseline="middle"
              fill="#0a0a0a"
              fontSize={labelLayout.fontSize}
              fontWeight={600}
              textAnchor="middle"
              transform={labelLayout.rotate ? `rotate(-90 ${labelLayout.x} ${labelLayout.y})` : undefined}
            >
              <tspan x={labelLayout.x} dy={`-${labelLayout.offset}`}>
                {labelLayout.label}
              </tspan>
              <tspan
                x={labelLayout.x}
                dy={Math.max(10, Math.floor(labelLayout.dimensionSize * 1.2))}
                fontSize={labelLayout.dimensionSize}
                fontWeight={500}
              >
                {labelLayout.dimensions}
              </tspan>
            </text>
          </g>
        )
      })}
      {sheet.cuts.map((cut) => {
        const cutColor = cut.orientation === "horizontal" ? "#2563eb" : "#ef4444"

        return (
          <line
            key={`${cut.id}-line`}
            x1={cut.x1}
            y1={cut.y1}
            x2={cut.x2}
            y2={cut.y2}
            stroke={cutColor}
            strokeWidth={5}
          />
        )
      })}
      {cutMarkers.map((marker) => {
        return (
          <g key={`${marker.cutId}-marker`}>
            <circle cx={marker.x} cy={marker.y} r={cutLabelSize} fill={marker.color} stroke="#ffffff" strokeWidth={3} />
            <text
              x={marker.x}
              y={marker.y}
              dominantBaseline="middle"
              fill="#ffffff"
              fontSize={cutLabelSize}
              fontWeight={700}
              textAnchor="middle"
            >
              {marker.order}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

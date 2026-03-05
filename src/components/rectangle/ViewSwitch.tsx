import { Button, ButtonGroup } from "@heroui/react"

export type RectangleViewMode = "simple" | "advanced"

interface ViewSwitchProps {
  viewMode: RectangleViewMode
  onChange: (mode: RectangleViewMode) => void
}

export function ViewSwitch({ viewMode, onChange }: ViewSwitchProps) {
  return (
    <div className="flex w-full items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
      <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted)]">View Mode</p>
      <ButtonGroup size="sm">
        <Button
          onPress={() => onChange("simple")}
          variant={viewMode === "simple" ? "primary" : "outline"}
        >
          Simple View
        </Button>
        <Button
          onPress={() => onChange("advanced")}
          variant={viewMode === "advanced" ? "primary" : "outline"}
        >
          Advanced View
        </Button>
      </ButtonGroup>
    </div>
  )
}

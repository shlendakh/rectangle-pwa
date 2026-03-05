export type RectangleViewMode = "simple" | "advanced"

interface ViewSwitchProps {
  viewMode: RectangleViewMode
  onChange: (mode: RectangleViewMode) => void
}

export function ViewSwitch({ viewMode, onChange }: ViewSwitchProps) {
  const baseClass = "w-full rounded-lg px-4 py-3 text-sm font-semibold transition-colors"

  return (
    <div className="w-full rounded-xl border border-neutral-300 bg-white p-1">
      <div className="grid grid-cols-2 gap-1">
        <button
          type="button"
          className={`${baseClass} ${
            viewMode === "simple" ? "bg-emerald-500 text-white" : "bg-transparent text-neutral-700 hover:bg-neutral-100"
          }`}
          onClick={() => onChange("simple")}
        >
          Simple View
        </button>
        <button
          type="button"
          className={`${baseClass} ${
            viewMode === "advanced"
              ? "bg-emerald-500 text-white"
              : "bg-transparent text-neutral-700 hover:bg-neutral-100"
          }`}
          onClick={() => onChange("advanced")}
        >
          Advanced View
        </button>
      </div>
    </div>
  )
}

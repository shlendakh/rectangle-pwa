import { Button } from "@heroui/react"
import { type RectangleViewMode, ViewSwitch } from "./ViewSwitch"
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

interface RectangleToolbarProps {
  viewMode: RectangleViewMode
  onViewModeChange: (mode: RectangleViewMode) => void
  onBack: () => void
}

export function RectangleToolbar({ viewMode, onViewModeChange, onBack }: RectangleToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Button onPress={onBack} variant="outline">
        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
        Back to Home
      </Button>
      <div className="w-full sm:max-w-md">
        <ViewSwitch viewMode={viewMode} onChange={onViewModeChange} />
      </div>
    </div>
  )
}

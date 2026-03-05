import { Card, CardContent, CardHeader, Chip, Spinner } from "@heroui/react"

interface SolverLoadingCardProps {
  currentStep: number
  totalSteps: number
  strategyId: string
  progressPercent: number
}

export function SolverLoadingCard({
  currentStep,
  totalSteps,
  strategyId,
  progressPercent,
}: SolverLoadingCardProps) {
  return (
    <Card>
      <CardHeader>
        <h1 className="text-2xl font-semibold">Rectangle Solver</h1>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Spinner color="success" size="lg" />
          <p className="text-sm text-(--foreground)/80">
            Calculating {currentStep}/{totalSteps} step
            {currentStep === 1 ? "" : "s"}
            {strategyId ? `.` : ""}
          </p>
          {strategyId ? (
            <Chip color="success" size="sm" variant="soft">
              {strategyId}
            </Chip>
          ) : null}
        </div>
        <div className="bg-surface-secondary h-3 w-full overflow-hidden rounded-full">
          <div
            className="h-full bg-emerald-500 transition-[width] duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </CardContent>
    </Card>
  )
}

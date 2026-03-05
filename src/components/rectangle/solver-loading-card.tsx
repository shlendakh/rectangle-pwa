import { Card, CardContent, CardHeader } from "@heroui/react"

interface SolverLoadingCardProps {
  currentStep: number
  totalSteps: number
  strategyId: string
  progressPercent: number
}

export function SolverLoadingCard({ currentStep, totalSteps, strategyId, progressPercent }: SolverLoadingCardProps) {
  return (
    <Card>
      <CardHeader>
        <h1 className="text-2xl font-semibold">Rectangle Solver Mockup</h1>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-emerald-500" />
          <p className="text-sm text-neutral-600">
            Calculating {currentStep}/{totalSteps} step
            {currentStep === 1 ? "" : "s"}
            {strategyId ? ` - ${strategyId}` : ""}
          </p>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-200">
          <div className="h-full bg-emerald-500 transition-[width] duration-300" style={{ width: `${progressPercent}%` }} />
        </div>
      </CardContent>
    </Card>
  )
}

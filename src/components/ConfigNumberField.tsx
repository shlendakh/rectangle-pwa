import { Input } from "@heroui/react"
import type { ChangeEvent } from "react"

interface ConfigNumberFieldProps {
  label: string
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  step?: string
}

export function ConfigNumberField({ label, value, onChange, step }: ConfigNumberFieldProps) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span>{label}</span>
      <Input
        className="border-border w-full border bg-(--field-background) shadow-none"
        onChange={onChange}
        step={step}
        type="number"
        value={value}
        variant="secondary"
      />
    </label>
  )
}

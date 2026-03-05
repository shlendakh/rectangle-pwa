import { Alert, Button } from "@heroui/react"
import Link from "next/link"

export function SupportAlert() {
  return (
    <Alert className="flex flex-col border border-emerald-500/35 bg-emerald-500/30 sm:flex-row">
      <Alert.Content className="flex flex-row gap-4">
        <Alert.Indicator className="hidden sm:block" />
        <Alert.Description>
          If you find this tool useful, your support would be greatly appreciated! Consider buying
          me a coffee to fuel the development and maintenance of this project.
        </Alert.Description>
      </Alert.Content>

      <Link href="https://ko-fi.com/shlendakh" rel="noreferrer" target="_blank">
        <Button variant="primary" size="sm" className="w-full sm:w-auto">
          Buy me a coffee
        </Button>
      </Link>
    </Alert>
  )
}

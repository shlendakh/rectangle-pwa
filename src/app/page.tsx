import { Button, Card, CardContent, CardHeader } from "@heroui/react"

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <h1 className="text-2xl font-semibold">Rectangle Cut</h1>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-4">
          <p>Initial setup complete.</p>
          <Button variant="primary">New Cut Plan</Button>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import {
  Alert,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  ListBox,
  Select,
} from "@heroui/react"
import { type ChangeEvent, type DragEvent, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ConfigNumberField } from "@/components/ConfigNumberField"
import { SupportAlert } from "@/components/SupportAlert"
import { defaultPackingConfiguration, defaultSheet } from "@/services/rectangle/defaults"
import { saveImportedRectangleData } from "@/services/rectangle/session-input"
import { isCsvFileName, parseRectanglesCsvFile } from "@/services/import/csv-file"
import { importConfigSchema } from "@/services/import/import.schema"
import { downloadCsvTemplate } from "@/services/import/csv-template"
import Link from "next/link"

export default function HomeClient() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [isValidatingFile, setIsValidatingFile] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [parsedCsvData, setParsedCsvData] = useState<Awaited<
    ReturnType<typeof parseRectanglesCsvFile>
  > | null>(null)
  const [sheetWidth, setSheetWidth] = useState(defaultSheet.width.toString())
  const [sheetHeight, setSheetHeight] = useState(defaultSheet.height.toString())
  const [kerf, setKerf] = useState(defaultPackingConfiguration.kerf.toString())
  const [allowRotation, setAllowRotation] = useState(defaultPackingConfiguration.allowRotation)

  const setCsvFile = async (file: File | null) => {
    if (!file) {
      setSelectedFile(null)
      setParsedCsvData(null)
      return
    }

    if (!isCsvFileName(file.name)) {
      setSelectedFile(null)
      setParsedCsvData(null)
      setError("Selected file must be a .csv file.")
      return
    }

    try {
      setIsValidatingFile(true)
      const parsed = await parseRectanglesCsvFile(file)

      setSelectedFile(file)
      setParsedCsvData(parsed)
      setError(null)
    } catch (validationError) {
      setSelectedFile(null)
      setParsedCsvData(null)
      setError(validationError instanceof Error ? validationError.message : "Invalid CSV file.")
    } finally {
      setIsValidatingFile(false)
    }
  }

  const onFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    event.target.value = ""
    void setCsvFile(file)
  }

  const onFileDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0] ?? null
    void setCsvFile(file)
  }

  const configValidation = useMemo(() => {
    return importConfigSchema.safeParse({
      sheetWidth,
      sheetHeight,
      kerf,
    })
  }, [sheetWidth, sheetHeight, kerf])

  const canSubmit =
    Boolean(selectedFile) &&
    Boolean(parsedCsvData) &&
    configValidation.success &&
    !isImporting &&
    !isValidatingFile

  const submitImport = async () => {
    if (!selectedFile || !parsedCsvData) {
      setError("Please select a CSV file before submitting.")
      return
    }

    if (!configValidation.success) {
      const issue = configValidation.error.issues[0]
      setError(`Invalid configuration: ${issue.message}`)
      return
    }

    try {
      setError(null)
      setIsImporting(true)

      saveImportedRectangleData({
        ...parsedCsvData,
        sheet: {
          width: configValidation.data.sheetWidth,
          height: configValidation.data.sheetHeight,
        },
        configuration: {
          kerf: configValidation.data.kerf,
          allowRotation,
        },
      })

      router.push("/rectangle")
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "Failed to import CSV file.")
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="bg-background text-foreground flex min-h-screen justify-center p-6">
      <div className="flex w-full max-w-3xl flex-col gap-6">
        <Card className="border-border w-full border shadow-none">
          <CardHeader>
            <h1 className="text-2xl font-semibold">Rectangle Cut</h1>
          </CardHeader>
          <CardContent className="flex flex-col items-start gap-4">
            <p>
              Import a CSV file with columns: Name{" "}
              <span className="font-light italic">(optional)</span>, Qty, Width, Height. You can
              include extra columns - importer ignores them.
            </p>
            <Button
              onPress={() => {
                downloadCsvTemplate()
              }}
              variant="outline"
            >
              Download Template
            </Button>
            <section className="border-border w-full rounded-lg border p-4">
              <h2 className="mb-3 text-sm font-semibold tracking-wide uppercase">Sheet Config</h2>
              <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                <ConfigNumberField
                  label="Sheet Width (mm)"
                  onChange={(event) => setSheetWidth(event.target.value)}
                  value={sheetWidth}
                />
                <ConfigNumberField
                  label="Sheet Height (mm)"
                  onChange={(event) => setSheetHeight(event.target.value)}
                  value={sheetHeight}
                />
              </div>
            </section>

            <section className="border-border w-full rounded-lg border p-4">
              <h2 className="mb-3 text-sm font-semibold tracking-wide uppercase">Tool Config</h2>
              <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                <ConfigNumberField
                  label="Kerf (mm)"
                  onChange={(event) => setKerf(event.target.value)}
                  step="0.1"
                  value={kerf}
                />
                <div className="flex flex-col justify-end gap-1 text-sm">
                  <span>Rotation</span>
                  <Select
                    aria-label="Rotation setting"
                    className="w-full"
                    onSelectionChange={(key) => {
                      setAllowRotation(String(key) === "enabled")
                    }}
                    selectedKey={allowRotation ? "enabled" : "disabled"}
                    variant="secondary"
                  >
                    <Select.Trigger className="border-border border bg-(--field-background) shadow-none">
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        <ListBox.Item id="enabled">Enabled (90 degrees)</ListBox.Item>
                        <ListBox.Item id="disabled">Disabled</ListBox.Item>
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>
              </div>
            </section>

            <section className="border-border w-full rounded-lg border border-dashed p-4">
              <h2 className="mb-3 text-sm font-semibold tracking-wide uppercase">Import File</h2>
              <input
                ref={fileInputRef}
                accept=".csv,text/csv"
                className="hidden"
                onChange={onFileSelected}
                type="file"
              />
              <button
                className="border-border bg-surface-secondary hover:bg-surface-tertiary h-auto w-full cursor-pointer justify-start rounded-md border px-4 py-6 text-left text-sm transition-colors"
                onDragOver={(event: DragEvent<HTMLButtonElement>) => {
                  event.preventDefault()
                }}
                onDrop={onFileDrop}
                onClick={() => {
                  fileInputRef.current?.click()
                }}
                type="button"
              >
                <span className="block w-full">
                  <span className="block text-center font-medium">
                    Drag & drop CSV here or click to choose file
                  </span>
                  <span className="mt-1 block text-center text-(--foreground)/75">
                    {isValidatingFile
                      ? "Validating file..."
                      : selectedFile
                        ? `Selected: ${selectedFile.name}`
                        : "No file selected yet"}
                  </span>
                </span>
              </button>
            </section>

            {error && (
              <Alert status="danger">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Description>{error}</Alert.Description>
                </Alert.Content>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="border-separator flex flex-wrap gap-3 px-6 py-4">
            <Button
              isDisabled={!canSubmit}
              onPress={() => {
                void submitImport()
              }}
              variant="primary"
              size="sm"
              className="w-full"
            >
              {isImporting ? "Processing..." : "Proceed"}
            </Button>
          </CardFooter>
        </Card>

        <SupportAlert />

        <Card className="border-border border shadow-none">
          <CardHeader>
            <h2 className="text-lg font-semibold">Hail to Jukka Jylänki</h2>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              Patron saint of rectangle packing, destroyer of wasted pixels, and author of one of
              the most practical bin-packing references we use here.
            </p>
            <p>
              If this app saves wood, nerves, and coffee, part of the credit goes to Jukka and his
              legendary work.
            </p>
            <p>
              <Link
                className="text-emerald-500 underline"
                href="https://github.com/juj/RectangleBinPack"
                rel="noreferrer"
                target="_blank"
              >
                GitHub: RectangleBinPack
              </Link>
              {" · "}
              <Link
                className="text-emerald-500 underline"
                href="https://github.com/juj/RectangleBinPack/blob/master/RectangleBinPack.pdf"
                rel="noreferrer"
                target="_blank"
              >
                Paper: A Thousand Ways to Pack the Bin
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

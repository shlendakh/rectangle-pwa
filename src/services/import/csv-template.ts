const CSV_TEMPLATE = `Name,Qty,Width,Height,Notes
Side panel,2,600,300,Optional extra column
Top panel,1,600.5,250.25,Decimals supported
`

export function downloadCsvTemplate(): void {
  const blob = new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8" })
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement("a")

  anchor.href = objectUrl
  anchor.download = "rectangle-cut-template.csv"
  anchor.click()

  URL.revokeObjectURL(objectUrl)
}

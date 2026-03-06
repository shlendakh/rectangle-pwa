"use client"

import { faEye } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button, Card, CardContent, CardHeader, Pagination, Table } from "@heroui/react"
import { useState } from "react"
import { formatDateTime } from "@/services/date/date-format"
import type { CutHistoryEntry } from "@/services/rectangle/rectangle.types"

interface CutHistoryCardProps {
  historyEntries: CutHistoryEntry[]
  selectedHistoryEntryIds: string[]
  onToggleHistorySelection: (entryId: string, isSelected: boolean) => void
  onOpenHistoryEntry: (entryId: string) => void
  onDeleteSelectedHistoryEntries: () => void
  onDeleteAllHistoryEntries: () => void
}

const PAGE_SIZE = 10

function buildPaginationItems(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", totalPages]
  }

  if (currentPage >= totalPages - 3) {
    return [1, "ellipsis", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  }

  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages]
}

export function CutHistoryCard({
  historyEntries,
  selectedHistoryEntryIds,
  onToggleHistorySelection,
  onOpenHistoryEntry,
  onDeleteSelectedHistoryEntries,
  onDeleteAllHistoryEntries,
}: CutHistoryCardProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const canDeleteSelectedHistoryEntries = selectedHistoryEntryIds.length > 0
  const totalPages = Math.max(1, Math.ceil(historyEntries.length / PAGE_SIZE))
  const activePage = Math.min(currentPage, totalPages)
  const startIndex = (activePage - 1) * PAGE_SIZE
  const visibleEntries = historyEntries.slice(startIndex, startIndex + PAGE_SIZE)
  const paginationItems = buildPaginationItems(activePage, totalPages)

  return (
    <Card className="border-border border shadow-none">
      <CardHeader className="flex flex-col items-start gap-2">
        <h2 className="text-xl font-semibold">Saved Cuts</h2>
        <p className="text-sm text-(--foreground)/75">
          Saved results are stored locally on this device. If you clear cookies or site data, this
          history will be lost.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            isDisabled={!canDeleteSelectedHistoryEntries}
            onPress={onDeleteSelectedHistoryEntries}
            size="sm"
            variant="outline"
          >
            Delete Selected
          </Button>
          <Button onPress={onDeleteAllHistoryEntries} size="sm" variant="outline">
            Delete All
          </Button>
        </div>

        <div className="hidden md:block">
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label="Saved cuts history table">
                <Table.Header>
                  <Table.Column width={80}>Select</Table.Column>
                  <Table.Column>File</Table.Column>
                  <Table.Column>Generated</Table.Column>
                  <Table.Column width={120}>Actions</Table.Column>
                </Table.Header>
                <Table.Body>
                  {visibleEntries.map((entry) => (
                    <Table.Row id={entry.id} key={entry.id}>
                      <Table.Cell>
                        <label className="sr-only" htmlFor={`history-checkbox-desktop-${entry.id}`}>
                          Select history entry {entry.sourceFileName}
                        </label>
                        <input
                          checked={selectedHistoryEntryIds.includes(entry.id)}
                          className="h-4 w-4"
                          id={`history-checkbox-desktop-${entry.id}`}
                          onChange={(event) => {
                            onToggleHistorySelection(entry.id, event.target.checked)
                          }}
                          type="checkbox"
                        />
                      </Table.Cell>
                      <Table.Cell>{entry.sourceFileName}</Table.Cell>
                      <Table.Cell>{formatDateTime(entry.generatedAt)}</Table.Cell>
                      <Table.Cell>
                        <Button
                          aria-label={`Open cut ${entry.sourceFileName}`}
                          isIconOnly
                          onPress={() => {
                            onOpenHistoryEntry(entry.id)
                          }}
                          size="sm"
                          variant="outline"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        </div>

        <div className="space-y-3 md:hidden">
          {visibleEntries.map((entry) => (
            <div className="border-border rounded-md border p-3" key={entry.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{entry.sourceFileName}</p>
                  <p className="text-xs text-(--foreground)/75">{formatDateTime(entry.generatedAt)}</p>
                </div>
                <label className="flex items-center gap-2 text-xs">
                  <span className="sr-only">Select history entry {entry.sourceFileName}</span>
                  <input
                    checked={selectedHistoryEntryIds.includes(entry.id)}
                    className="h-4 w-4"
                    onChange={(event) => {
                      onToggleHistorySelection(entry.id, event.target.checked)
                    }}
                    type="checkbox"
                  />
                </label>
              </div>
              <div className="mt-3">
                <Button
                  className="w-full"
                  onPress={() => {
                    onOpenHistoryEntry(entry.id)
                  }}
                  size="sm"
                  variant="outline"
                >
                  <FontAwesomeIcon className="mr-2" icon={faEye} />
                  Open
                </Button>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <Pagination className="justify-center" size="sm">
            <Pagination.Content>
              <Pagination.Item>
                <Pagination.Previous
                  isDisabled={activePage === 1}
                  onPress={() => {
                    setCurrentPage((previousPage) => Math.max(1, previousPage - 1))
                  }}
                >
                  <Pagination.PreviousIcon />
                </Pagination.Previous>
              </Pagination.Item>

              {paginationItems.map((item, index) => (
                <Pagination.Item key={`${item}-${index}`}>
                  {item === "ellipsis" ? (
                    <Pagination.Ellipsis />
                  ) : (
                    <Pagination.Link
                      isActive={item === activePage}
                      onPress={() => {
                        setCurrentPage(item)
                      }}
                    >
                      {item}
                    </Pagination.Link>
                  )}
                </Pagination.Item>
              ))}

              <Pagination.Item>
                <Pagination.Next
                  isDisabled={activePage === totalPages}
                  onPress={() => {
                    setCurrentPage((previousPage) => Math.min(totalPages, previousPage + 1))
                  }}
                >
                  <Pagination.NextIcon />
                </Pagination.Next>
              </Pagination.Item>
            </Pagination.Content>
          </Pagination>
        )}
      </CardContent>
    </Card>
  )
}

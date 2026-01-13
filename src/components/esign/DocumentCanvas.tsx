"use client"

import dynamic from "next/dynamic"
import type { PlacedElement, ElementType } from "./types"

const DocumentCanvasInner = dynamic(
  () => import("./DocumentCanvasInner"),
  { 
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-slate-200 dark:bg-slate-900 rounded-xl min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <span className="text-sm text-muted-foreground">Loading document viewer...</span>
        </div>
      </div>
    )
  }
)

interface DocumentCanvasProps {
  file: File
  activeTool: ElementType | null
  elements: PlacedElement[]
  selectedElementId: string | null
  onAddElement: (element: Omit<PlacedElement, "id">) => void
  onUpdateElement: (id: string, updates: Partial<PlacedElement>) => void
  onRemoveElement: (id: string) => void
  onSelectElement: (id: string | null) => void
  pageNumber: number
  setPageNumber: (n: number) => void
  pendingContent: string | null
  onClearPendingContent: () => void
}

export function DocumentCanvas(props: DocumentCanvasProps) {
  return <DocumentCanvasInner {...props} />
}

"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import * as pdfjsLib from "pdfjs-dist"
import { toast } from "sonner"
import { ElementType, PlacedElement, TOOL_CONFIGS } from "./types"
import { DraggableElement } from "./DraggableElement"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize } from "lucide-react"
import { cn } from "@/lib/utils"

// Setup worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`

interface DocumentCanvasInnerProps {
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

export default function DocumentCanvasInner({
  file,
  activeTool,
  elements,
  selectedElementId,
  onAddElement,
  onUpdateElement,
  onRemoveElement,
  onSelectElement,
  pageNumber,
  setPageNumber,
  pendingContent,
  onClearPendingContent,
}: DocumentCanvasInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const [numPages, setNumPages] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [pdfDoc, setPdfDoc] = useState<any>(null)
  const [pageRendering, setPageRendering] = useState(false)
  const [isImage, setIsImage] = useState(false)

  /* -------------------- LOAD FILE -------------------- */
  useEffect(() => {
    if (!file) return

    if (file.type === "application/pdf") {
      setIsImage(false)
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const pdf = await pdfjsLib.getDocument({ data }).promise
          setPdfDoc(pdf)
          setNumPages(pdf.numPages)
          setPageNumber(1)
        } catch (error) {
          console.error("Error loading PDF:", error)
          toast.error("Failed to load PDF document", {
            description: "The file might be corrupted or in an unsupported format.",
          })
        }
      }
      reader.onerror = () => {
        toast.error("Failed to read the file.")
      }
      reader.readAsArrayBuffer(file)
    } else if (file.type.startsWith("image/")) {
      setIsImage(true)
      setNumPages(1)
      setPageNumber(1)
    }
  }, [file, setPageNumber])

  /* -------------------- RENDER PDF -------------------- */
  const renderPage = useCallback(async (num: number) => {
    if (!pdfDoc || !canvasRef.current || pageRendering) return

    setPageRendering(true)
    try {
      const page = await pdfDoc.getPage(num)

      // IMPORTANT: scale = 1 (logical units only)
      const viewport = page.getViewport({ scale: 1 })

      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      canvas.width = viewport.width
      canvas.height = viewport.height

      await page.render({
        canvasContext: ctx,
        viewport,
      }).promise
    } catch (error) {
      console.error("Error rendering page:", error)
      toast.error(`Failed to render page ${num}`, {
        description: "Please try refreshing the page or re-uploading the document.",
      })
    } finally {
      setPageRendering(false)
    }
  }, [pdfDoc, pageRendering])

  /* -------------------- RENDER IMAGE -------------------- */
  const renderImage = useCallback(() => {
    if (!canvasRef.current || !isImage) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    }
    img.onerror = () => {
      toast.error("Failed to load document image", {
        description: "The image file might be corrupted.",
      })
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }, [file, isImage])

  useEffect(() => {
    if (isImage) {
      renderImage()
    } else {
      renderPage(pageNumber)
    }
  }, [pageNumber, pdfDoc, isImage, renderImage, renderPage])

  /* -------------------- CLICK TO ADD ELEMENT -------------------- */
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!activeTool || !wrapperRef.current) return

    const rect = wrapperRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / zoom
    const y = (e.clientY - rect.top) / zoom

    const config = TOOL_CONFIGS[activeTool]

    onAddElement({
      type: activeTool,
      x: x - config.defaultWidth / 2,
      y: y - config.defaultHeight / 2,
      pageNumber,
      width: config.defaultWidth,
      height: config.defaultHeight,
      content: pendingContent || "",
    })

    if (
      activeTool !== "signature" &&
      activeTool !== "initials" &&
      activeTool !== "image"
    ) {
      onClearPendingContent()
    }
  }

  const filteredElements = elements.filter(el => el.pageNumber === pageNumber)

  /* -------------------- JSX -------------------- */
  return (
    <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-900/50 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">

      {/* Controls */}
      <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-xl p-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
              disabled={pageNumber <= 1}
            >
              <ChevronLeft size={18} />
            </Button>
            <span className="px-3 text-sm font-bold min-w-[80px] text-center">
              Page {pageNumber} of {numPages || 1}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
              disabled={pageNumber >= numPages}
            >
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-xl p-1">
            <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>
              <ZoomOut size={16} />
            </Button>
            <span className="px-2 text-xs font-bold min-w-[50px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.min(2, z + 0.1))}>
              <ZoomIn size={16} />
            </Button>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setZoom(1)}>
            <Maximize size={18} />
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-8 flex justify-center items-start custom-scrollbar"
        onClick={() => onSelectElement(null)}
      >
        <div
          ref={wrapperRef}
          className={cn("relative shadow-2xl origin-top-left bg-white")}
          style={{
            width: canvasRef.current?.width || "auto",
            height: canvasRef.current?.height || "auto",
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
          }}
          onClick={(e) => {
            e.stopPropagation()
            onSelectElement(null)
          }}
        >

          <canvas ref={canvasRef} className="bg-white block w-full h-full" />

          <div className="absolute inset-0 pointer-events-none">
            <div className="relative w-full h-full pointer-events-auto">
              {filteredElements.map(el => (
                <DraggableElement
                  key={el.id}
                  element={el}
                  isSelected={selectedElementId === el.id}
                  onSelect={() => onSelectElement(el.id)}
                  onUpdate={(updates) => onUpdateElement(el.id, updates)}
                  onRemove={() => onRemoveElement(el.id)}
                  zoom={1}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

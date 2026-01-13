"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import * as pdfjsLib from "pdfjs-dist"
import { ElementType, PlacedElement, TOOL_CONFIGS } from "./types"
import { DraggableElement } from "./DraggableElement"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize, MousePointer2 } from "lucide-react"
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

const LOGICAL_PAGE_WIDTH = 800

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
  const [zoom, setZoom] = useState(1.0)
  const [pdfDoc, setPdfDoc] = useState<any>(null)
  const [pageRendering, setPageRendering] = useState(false)
  const [isImage, setIsImage] = useState(false)
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })

  // Load PDF or Image
  useEffect(() => {
    if (!file) return

    if (file.type === "application/pdf") {
      setIsImage(false)
      const reader = new FileReader()
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const loadingTask = pdfjsLib.getDocument({ data })
        const pdf = await loadingTask.promise
        setPdfDoc(pdf)
        setNumPages(pdf.numPages)
        setPageNumber(1)
      }
      reader.readAsArrayBuffer(file)
    } else if (file.type.startsWith("image/")) {
      setIsImage(true)
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          setImageSize({ width: img.width, height: img.height })
          setNumPages(1)
          setPageNumber(1)
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    }
  }, [file, setPageNumber])

  // Render Page
  const renderPage = useCallback(async (num: number, currentZoom: number) => {
    if (!pdfDoc || !canvasRef.current || pageRendering) return

    setPageRendering(true)
    try {
      const page = await pdfDoc.getPage(num)
      const viewport = page.getViewport({ scale: 1.5 }) // Base scale for quality
      
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")
      if (!context) return

      // Calculate scale to fit LOGICAL_PAGE_WIDTH
      const scaleToFit = LOGICAL_PAGE_WIDTH / viewport.width
      const finalViewport = page.getViewport({ scale: 1.5 * scaleToFit * currentZoom })

      canvas.height = finalViewport.height
      canvas.width = finalViewport.width

      const renderContext = {
        canvasContext: context,
        viewport: finalViewport,
      }
      await page.render(renderContext).promise
    } catch (error) {
      console.error("Error rendering page:", error)
    } finally {
      setPageRendering(false)
    }
  }, [pdfDoc, pageRendering])

  // Render Image
  const renderImage = useCallback(() => {
    if (!canvasRef.current || !isImage) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      const scaleToFit = LOGICAL_PAGE_WIDTH / img.width
      canvas.width = LOGICAL_PAGE_WIDTH * zoom
      canvas.height = (img.height * scaleToFit) * zoom
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    }
    const reader = new FileReader()
    reader.onload = (e) => { img.src = e.target?.result as string }
    reader.readAsDataURL(file)
  }, [file, isImage, zoom])

  useEffect(() => {
    if (isImage) {
      renderImage()
    } else {
      renderPage(pageNumber, zoom)
    }
  }, [pageNumber, zoom, pdfDoc, isImage, renderImage, renderPage])

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!activeTool || !wrapperRef.current) return

    const rect = wrapperRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / zoom
    const y = (e.clientY - rect.top) / zoom

    const config = TOOL_CONFIGS[activeTool]
    
    let content = ""
    if (activeTool === "date") {
      content = new Date().toLocaleDateString()
    } else if (pendingContent) {
      content = pendingContent
    }

    onAddElement({
      type: activeTool,
      x: x - (config.defaultWidth / 2),
      y: y - (config.defaultHeight / 2),
      pageNumber,
      width: config.defaultWidth,
      height: config.defaultHeight,
      content,
    })

    if (activeTool !== "signature" && activeTool !== "initials" && activeTool !== "image") {
      onClearPendingContent()
    }
  }

  const filteredElements = elements.filter(el => el.pageNumber === pageNumber)

  return (
    <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-900/50 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
      {/* Viewer Controls */}
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
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            >
              <ZoomOut size={16} />
            </Button>
            <span className="px-2 text-xs font-bold min-w-[50px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={() => setZoom(Math.min(2.0, zoom + 0.1))}
            >
              <ZoomIn size={16} />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl"
            onClick={() => setZoom(1.0)}
          >
            <Maximize size={18} />
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto p-8 flex justify-center items-start custom-scrollbar"
        onClick={() => onSelectElement(null)}
      >
        <div 
          ref={wrapperRef}
          className={cn(
            "relative shadow-2xl transition-all duration-200 origin-top",
            activeTool && "cursor-crosshair"
          )}
          style={{ 
            width: LOGICAL_PAGE_WIDTH * zoom,
            height: canvasRef.current ? canvasRef.current.height : "auto",
            transform: `scale(${zoom})`,
            transformOrigin: 'top left'
          }}
          onClick={(e) => {
            e.stopPropagation()
            handleCanvasClick(e)
          }}
        >
          <canvas
            ref={canvasRef}
            className="bg-white block w-full h-full"
          />
          
          {/* Draggable Elements Layer */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{ width: LOGICAL_PAGE_WIDTH, height: canvasRef.current ? canvasRef.current.height / zoom : "100%" }}
          >
            <div className="relative w-full h-full pointer-events-auto">
              {filteredElements.map((el) => (
                <DraggableElement
                  key={el.id}
                  element={el}
                  isSelected={selectedElementId === el.id}
                  onSelect={() => onSelectElement(el.id)}
                  onUpdate={(updates) => onUpdateElement(el.id, updates)}
                  onRemove={() => onRemoveElement(el.id)}
                  zoom={1} // We handle zoom via CSS transform on wrapper
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.2);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.3);
        }
      `}</style>
    </div>
  )
}

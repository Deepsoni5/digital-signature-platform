"use client"

import React, { useState, useCallback, useRef } from "react"
import { PDFDocument, rgb } from "pdf-lib"
import { saveAs } from "file-saver"
import { toast } from "sonner"
import { FileUploader } from "./FileUploader"
import { EditorToolbar } from "./EditorToolbar"
import { DocumentCanvas } from "./DocumentCanvas"
import { SignatureModal } from "./SignatureModal"
import { ElementType, PlacedElement, TOOL_CONFIGS } from "./types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Download, 
  Trash2, 
  FileUp, 
  PenTool,
  User,
  Image as ImageIcon,
  Layers,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Undo2,
  Redo2,
  Plus
} from "lucide-react"
import { cn } from "@/lib/utils"

const LOGICAL_PAGE_WIDTH = 800

export function EsignTool() {
  const [file, setFile] = useState<File | null>(null)
  const [activeTool, setActiveTool] = useState<ElementType | null>(null)
  const [elements, setElements] = useState<PlacedElement[]>([])
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [pageNumber, setPageNumber] = useState(1)
  
  const [history, setHistory] = useState<PlacedElement[][]>([[]])
  const [historyIndex, setHistoryIndex] = useState(0)
  
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [signatureMode, setSignatureMode] = useState<"signature" | "initials">("signature")
  const [pendingContent, setPendingContent] = useState<string | null>(null)
  
  const [savedSignature, setSavedSignature] = useState<string | null>(null)
  const [savedInitials, setSavedInitials] = useState<string | null>(null)
  
  const imageInputRef = useRef<HTMLInputElement>(null)

  const addToHistory = useCallback((newElements: PlacedElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newElements)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
    setElements(newElements)
  }, [history, historyIndex])

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevElements = history[historyIndex - 1]
      setElements(prevElements)
      setHistoryIndex(historyIndex - 1)
      setSelectedElementId(null)
    }
  }, [history, historyIndex])

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextElements = history[historyIndex + 1]
      setElements(nextElements)
      setHistoryIndex(historyIndex + 1)
      setSelectedElementId(null)
    }
  }, [history, historyIndex])

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile)
    setElements([])
    setHistory([[]])
    setHistoryIndex(0)
    setPageNumber(1)
    toast.success("Document uploaded!")
  }

  const handleClearFile = () => {
    setFile(null)
    setElements([])
    setHistory([[]])
    setHistoryIndex(0)
    setActiveTool(null)
    setPendingContent(null)
  }

  const handleToolSelect = (tool: ElementType | null) => {
    setActiveTool(tool)
    setSelectedElementId(null)
    
    if (tool === "signature") {
      setSignatureMode("signature")
      setShowSignatureModal(true)
    } else if (tool === "initials") {
      setSignatureMode("initials")
      setShowSignatureModal(true)
    } else if (tool === "image") {
      imageInputRef.current?.click()
    }
  }

  const handleSignatureSave = (dataUrl: string) => {
    if (signatureMode === "signature") {
      setSavedSignature(dataUrl)
    } else {
      setSavedInitials(dataUrl)
    }
    setPendingContent(dataUrl)
    setShowSignatureModal(false)
    toast.success(`${signatureMode === "signature" ? "Signature" : "Initials"} saved!`)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const imgFile = e.target.files?.[0]
    if (imgFile) {
      const reader = new FileReader()
      reader.onload = () => {
        setPendingContent(reader.result as string)
        toast.success("Image ready to place!")
      }
      reader.readAsDataURL(imgFile)
    }
    e.target.value = ""
  }

  const handleAddElement = useCallback((element: Omit<PlacedElement, "id">) => {
    const newElement: PlacedElement = {
      ...element,
      id: Math.random().toString(36).substr(2, 9),
    }
    const newElements = [...elements, newElement]
    addToHistory(newElements)
    setSelectedElementId(newElement.id)
    
    if (element.type !== "signature" && element.type !== "initials" && element.type !== "image") {
      setActiveTool(null)
    }
  }, [elements, addToHistory])

  const handleUpdateElement = useCallback((id: string, updates: Partial<PlacedElement>) => {
    const newElements = elements.map((el) => (el.id === id ? { ...el, ...updates } : el))
    setElements(newElements)
    // Debounce history updates for position changes? No, let's keep it simple for now
    // In a real app we'd only add to history on 'dragEnd'
  }, [elements])

  // Call this when drag/resize ends to commit to history
  const commitToHistory = useCallback(() => {
    addToHistory(elements)
  }, [elements, addToHistory])

  const handleRemoveElement = useCallback((id: string) => {
    const newElements = elements.filter((el) => el.id !== id)
    addToHistory(newElements)
    if (selectedElementId === id) setSelectedElementId(null)
  }, [elements, addToHistory, selectedElementId])

  const downloadSignedDocument = async () => {
    if (!file || elements.length === 0) {
      toast.error("Add at least one element.")
      return
    }

    setIsProcessing(true)
    try {
      if (file.type === "application/pdf") {
        const fileBuffer = await file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(fileBuffer)
        const pages = pdfDoc.getPages()

        for (const el of elements) {
          const page = pages[el.pageNumber - 1]
          if (!page) continue

          const { width: pdfWidth, height: pdfHeight } = page.getSize()
          const scale = pdfWidth / LOGICAL_PAGE_WIDTH

          const x = el.x * scale
          const y = pdfHeight - (el.y * scale) - (el.height * scale)
          const w = el.width * scale
          const h = el.height * scale

          if (el.type === "signature" || el.type === "initials" || el.type === "image") {
            const imgBytes = await fetch(el.content).then((r) => r.arrayBuffer())
            const img = el.content.includes("image/png")
              ? await pdfDoc.embedPng(imgBytes)
              : await pdfDoc.embedJpg(imgBytes)
            page.drawImage(img, { x, y, width: w, height: h })
          } else if (el.type === "text" || el.type === "date") {
            const font = await pdfDoc.embedFont("Helvetica" as const)
            page.drawText(el.content, {
              x,
              y: y + h / 2 - (6 * scale),
              size: (el.fontSize || 14) * scale,
              font,
              color: rgb(0, 0, 0),
            })
          } else if (el.type === "checkbox") {
            page.drawRectangle({
              x,
              y,
              width: w,
              height: h,
              borderColor: rgb(0, 0, 0),
              borderWidth: 1.5,
            })
            if (el.checked) {
              page.drawLine({
                start: { x: x + (2 * scale), y: y + h / 2 },
                end: { x: x + w / 3, y: y + (2 * scale) },
                thickness: 2 * scale,
                color: rgb(0.2, 0.4, 0.8),
              })
              page.drawLine({
                start: { x: x + w / 3, y: y + (2 * scale) },
                end: { x: x + w - (2 * scale), y: y + h - (2 * scale) },
                thickness: 2 * scale,
                color: rgb(0.2, 0.4, 0.8),
              })
            }
          }
        }

        const pdfBytes = await pdfDoc.save()
        saveAs(new Blob([pdfBytes.buffer as ArrayBuffer]), `signed_${file.name}`)
      } else {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const img = new Image()
        img.src = URL.createObjectURL(file)
        await new Promise((resolve) => (img.onload = resolve))

        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        const scale = img.width / LOGICAL_PAGE_WIDTH

        for (const el of elements) {
          const x = el.x * scale
          const y = el.y * scale
          const w = el.width * scale
          const h = el.height * scale

          if (el.type === "signature" || el.type === "initials" || el.type === "image") {
            const sigImg = new Image()
            sigImg.src = el.content
            await new Promise((resolve) => (sigImg.onload = resolve))
            ctx.drawImage(sigImg, x, y, w, h)
          } else if (el.type === "text" || el.type === "date") {
            ctx.font = `${(el.fontSize || 14) * scale}px Arial`
            ctx.fillStyle = "#000"
            ctx.fillText(el.content, x, y + h / 2 + (5 * scale))
          } else if (el.type === "checkbox") {
            ctx.strokeStyle = "#000"
            ctx.lineWidth = 2 * scale
            ctx.strokeRect(x, y, w, h)
            if (el.checked) {
              ctx.strokeStyle = "#3366cc"
              ctx.lineWidth = 3 * scale
              ctx.beginPath()
              ctx.moveTo(x + (2 * scale), y + h / 2)
              ctx.lineTo(x + w / 3, y + h - (2 * scale))
              ctx.lineTo(x + w - (2 * scale), y + (2 * scale))
              ctx.stroke()
            }
          }
        }

        canvas.toBlob((blob) => {
          if (blob) saveAs(blob, `signed_${file.name.replace(/\.[^/.]+$/, "")}.png`)
        }, "image/png")
      }
      toast.success("Document signed and downloaded!")
    } catch (error) {
      console.error(error)
      toast.error("Error saving document.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      {!file ? (
        <div className="max-w-3xl mx-auto w-full pt-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center rounded-full bg-indigo-500/10 px-4 py-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-6">
              Step 1: Upload your document
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight mb-4">Start Signing Your PDF</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              Drop your file below to enter the editor. We support PDF, JPG, and PNG formats.
            </p>
          </div>
          <FileUploader
            onFileSelect={handleFileSelect}
            selectedFile={file}
            onClear={handleClearFile}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Main Workspace */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* Left Tools Panel - Floating Style */}
            <div className="xl:col-span-3 space-y-4">
              <Card className="border-none shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] overflow-hidden">
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Saved Assets</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {savedSignature ? (
                        <div className="group relative p-3 border-2 border-indigo-100 dark:border-indigo-900/50 rounded-2xl bg-white dark:bg-slate-950 transition-all hover:border-indigo-500">
                          <img src={savedSignature} alt="Signature" className="h-12 w-full object-contain" />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            onClick={() => {
                              setSavedSignature(null)
                              setPendingContent(null)
                            }}
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="h-16 rounded-2xl border-dashed border-2 hover:border-indigo-500 hover:bg-indigo-50 transition-all flex flex-col items-center justify-center gap-1 group"
                          onClick={() => {
                            setSignatureMode("signature")
                            setShowSignatureModal(true)
                          }}
                        >
                          <PenTool size={18} className="text-slate-400 group-hover:text-indigo-600" />
                          <span className="text-[10px] font-bold uppercase">Add Signature</span>
                        </Button>
                      )}

                      {savedInitials ? (
                        <div className="group relative p-3 border-2 border-indigo-100 dark:border-indigo-900/50 rounded-2xl bg-white dark:bg-slate-950 transition-all hover:border-indigo-500">
                          <img src={savedInitials} alt="Initials" className="h-10 w-full object-contain" />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            onClick={() => {
                              setSavedInitials(null)
                              setPendingContent(null)
                            }}
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="h-16 rounded-2xl border-dashed border-2 hover:border-indigo-500 hover:bg-indigo-50 transition-all flex flex-col items-center justify-center gap-1 group"
                          onClick={() => {
                            setSignatureMode("initials")
                            setShowSignatureModal(true)
                          }}
                        >
                          <User size={18} className="text-slate-400 group-hover:text-indigo-600" />
                          <span className="text-[10px] font-bold uppercase">Add Initials</span>
                        </Button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Quick Tools</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        className="h-14 rounded-xl flex flex-col items-center justify-center gap-1 text-[10px] font-bold uppercase hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                        onClick={() => handleToolSelect("text")}
                      >
                        <Plus size={16} /> Text
                      </Button>
                      <Button
                        variant="outline"
                        className="h-14 rounded-xl flex flex-col items-center justify-center gap-1 text-[10px] font-bold uppercase hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                        onClick={() => handleToolSelect("date")}
                      >
                        <Plus size={16} /> Date
                      </Button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Button
                      onClick={downloadSignedDocument}
                      className="w-full h-14 rounded-2xl text-lg font-bold shadow-2xl shadow-indigo-500/40 bg-indigo-600 hover:bg-indigo-700 transition-all active:scale-95"
                      disabled={elements.length === 0 || isProcessing}
                    >
                      {isProcessing ? (
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 animate-spin rounded-full border-3 border-current border-t-transparent" />
                          Saving...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Download size={20} />
                          Finalize PDF
                        </div>
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full mt-4 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl"
                      onClick={handleClearFile}
                    >
                      <FileUp size={16} className="mr-2" />
                      Discard & Exit
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Element List Card */}
              {elements.length > 0 && (
                <Card className="border-none shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-[2rem] overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Layer Stack</h3>
                      <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full font-bold">
                        {elements.length}
                      </span>
                    </div>
                    <div className="max-h-[250px] overflow-auto space-y-2 custom-scrollbar">
                      {elements.map((el, i) => (
                        <div
                          key={el.id}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all border cursor-pointer",
                            selectedElementId === el.id
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                              : "bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 hover:border-indigo-300"
                          )}
                          onClick={() => setSelectedElementId(el.id)}
                        >
                          <span className="capitalize truncate">
                            {el.type} {i + 1}
                          </span>
                          <button
                            className={cn(
                              "p-1 rounded-lg transition-colors",
                              selectedElementId === el.id ? "hover:bg-white/20 text-white" : "hover:bg-red-50 text-slate-400 hover:text-red-500"
                            )}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveElement(el.id)
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Document Viewer Column */}
            <div className="xl:col-span-9 space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] shadow-xl">
                <div className="flex items-center gap-2">
                  <EditorToolbar 
                    activeTool={activeTool} 
                    onToolSelect={handleToolSelect} 
                    canUndo={historyIndex > 0}
                    canRedo={historyIndex < history.length - 1}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                  />
                </div>
                
                <div className="flex items-center gap-3">
                   <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold text-slate-500 flex items-center gap-2">
                     <CheckCircle2 size={14} className="text-emerald-500" />
                     Encrypted Secure Session
                   </div>
                </div>
              </div>

              <div className="min-h-[700px] flex">
                <DocumentCanvas
                  file={file}
                  activeTool={activeTool}
                  elements={elements}
                  selectedElementId={selectedElementId}
                  onAddElement={handleAddElement}
                  onUpdateElement={handleUpdateElement}
                  onRemoveElement={handleRemoveElement}
                  onSelectElement={setSelectedElementId}
                  pageNumber={pageNumber}
                  setPageNumber={setPageNumber}
                  pendingContent={pendingContent}
                  onClearPendingContent={() => setPendingContent(null)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {showSignatureModal && (
        <SignatureModal
          onSave={handleSignatureSave}
          onCancel={() => setShowSignatureModal(false)}
          mode={signatureMode}
        />
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.4);
        }
      `}</style>
    </div>
  )
}

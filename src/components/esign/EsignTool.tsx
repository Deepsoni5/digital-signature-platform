"use client"

import React, { useState, useCallback, useRef } from "react"
import { PDFDocument, rgb } from "pdf-lib"
import { saveAs } from "file-saver"
import { toast } from "sonner"
import { FileUploader } from "./FileUploader"
import { EditorToolbar } from "./EditorToolbar"
import { DocumentCanvas } from "./DocumentCanvas"
import { SignatureModal } from "./SignatureModal"
import { TextModal } from "./TextModal"
import { DateModal } from "./DateModal"
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
  Plus,
  Menu
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SidebarTools } from "./SidebarTools"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

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
  const [showTextModal, setShowTextModal] = useState(false)
  const [showDateModal, setShowDateModal] = useState(false)
  const [signatureMode, setSignatureMode] = useState<"signature" | "initials">("signature")
  const [pendingContent, setPendingContent] = useState<string | null>(null)
  
  const [savedSignature, setSavedSignature] = useState<string | null>(null)
  const [savedInitials, setSavedInitials] = useState<string | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  
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
    if (activeTool === tool) {
      setActiveTool(null)
      setPendingContent(null)
      return
    }

    setActiveTool(null) // Reset active tool for auto-placement
    setSelectedElementId(null)
    
    if (tool === "signature") {
      setSignatureMode("signature")
      setShowSignatureModal(true)
    } else if (tool === "initials") {
      setSignatureMode("initials")
      setShowSignatureModal(true)
    } else if (tool === "image") {
      imageInputRef.current?.click()
    } else if (tool === "text") {
      setShowTextModal(true)
    } else if (tool === "date") {
      setShowDateModal(true)
    } else if (tool === "checkbox") {
      const config = TOOL_CONFIGS["checkbox"]
      handleAddElement({
        type: "checkbox",
        content: "",
        x: 100,
        y: 200,
        width: config.defaultWidth,
        height: config.defaultHeight,
        pageNumber,
      })
    }
  }

  const handleSignatureSave = (dataUrl: string) => {
    if (signatureMode === "signature") {
      setSavedSignature(dataUrl)
    } else {
      setSavedInitials(dataUrl)
    }
    setShowSignatureModal(false)
    
    const type = signatureMode === "signature" ? "signature" : "initials"
    const config = TOOL_CONFIGS[type]
    handleAddElement({
      type,
      content: dataUrl,
      x: 100,
      y: signatureMode === "signature" ? 100 : 150,
      width: config.defaultWidth,
      height: config.defaultHeight,
      pageNumber,
    })
    
    toast.success(`${signatureMode === "signature" ? "Signature" : "Initials"} saved and added!`)
  }

  const handleTextSave = (text: string) => {
    const config = TOOL_CONFIGS["text"]
    handleAddElement({
      type: "text",
      content: text,
      x: 100,
      y: 250,
      width: config.defaultWidth,
      height: config.defaultHeight,
      pageNumber,
      fontSize: 16,
    })
    setShowTextModal(false)
    toast.success("Text added to document!")
  }

  const handleDateSave = (date: string) => {
    const config = TOOL_CONFIGS["date"]
    handleAddElement({
      type: "date",
      content: date,
      x: 100,
      y: 300,
      width: config.defaultWidth,
      height: config.defaultHeight,
      pageNumber,
      fontSize: 16,
    })
    setShowDateModal(false)
    toast.success("Date added to document!")
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const imgFile = e.target.files?.[0]
    if (imgFile) {
      const reader = new FileReader()
      reader.onload = () => {
        const config = TOOL_CONFIGS["image"]
        handleAddElement({
          type: "image",
          content: reader.result as string,
          x: 100,
          y: 350,
          width: config.defaultWidth,
          height: config.defaultHeight,
          pageNumber,
        })
        toast.success("Image added to document!")
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

            const x = el.x
            const y = pdfHeight - el.y - el.height
            const w = el.width
            const h = el.height

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
                y: y + h / 2 - 6,
                size: el.fontSize || 14,
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
                  start: { x: x + 2, y: y + h / 2 },
                  end: { x: x + w / 3, y: y + 2 },
                  thickness: 2,
                  color: rgb(0.2, 0.4, 0.8),
                })
                page.drawLine({
                  start: { x: x + w / 3, y: y + 2 },
                  end: { x: x + w - 2, y: y + h - 2 },
                  thickness: 2,
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

        for (const el of elements) {
          const x = el.x
          const y = el.y
          const w = el.width
          const h = el.height

          if (el.type === "signature" || el.type === "initials" || el.type === "image") {
            const sigImg = new Image()
            sigImg.src = el.content
            await new Promise((resolve) => (sigImg.onload = resolve))
            ctx.drawImage(sigImg, x, y, w, h)
          } else if (el.type === "text" || el.type === "date") {
            ctx.font = `${el.fontSize || 14}px Arial`
            ctx.fillStyle = "#000"
            ctx.fillText(el.content, x, y + h / 2 + 5)
          } else if (el.type === "checkbox") {
            ctx.strokeStyle = "#000"
            ctx.lineWidth = 2
            ctx.strokeRect(x, y, w, h)
            if (el.checked) {
              ctx.strokeStyle = "#3366cc"
              ctx.lineWidth = 3
              ctx.beginPath()
              ctx.moveTo(x + 2, y + h / 2)
              ctx.lineTo(x + w / 3, y + h - 2)
              ctx.lineTo(x + w - 2, y + 2)
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
              
              {/* Desktop Left Tools Panel */}
              <div className="hidden xl:block xl:col-span-3">
                <SidebarTools
                  savedSignature={savedSignature}
                  setSavedSignature={setSavedSignature}
                  savedInitials={savedInitials}
                  setSavedInitials={setSavedInitials}
                  setSignatureMode={setSignatureMode}
                  setShowSignatureModal={setShowSignatureModal}
                  setPendingContent={setPendingContent}
                  handleToolSelect={handleToolSelect}
                  downloadSignedDocument={downloadSignedDocument}
                  isProcessing={isProcessing}
                  elements={elements}
                  handleClearFile={handleClearFile}
                  selectedElementId={selectedElementId}
                  setSelectedElementId={setSelectedElementId}
                  handleRemoveElement={handleRemoveElement}
                />
              </div>

              {/* Document Viewer Column */}
              <div className="xl:col-span-9 space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] shadow-xl">
                <div className="hidden xl:flex items-center gap-2">
                  <EditorToolbar 
                    activeTool={activeTool} 
                    onToolSelect={handleToolSelect} 
                    canUndo={historyIndex > 0}
                    canRedo={historyIndex < history.length - 1}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                  />
                </div>
                
                  <div className="flex items-center justify-between w-full xl:w-auto gap-3">
                     <div className="xl:hidden flex items-center gap-2">
                       <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                         <SheetTrigger asChild>
                           <Button variant="outline" className="h-12 rounded-2xl border-indigo-200 bg-indigo-50/50 text-indigo-700 font-bold gap-2">
                             <Menu size={18} />
                             Tools
                           </Button>
                         </SheetTrigger>
                         <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-auto pt-10">
                           <SheetHeader className="mb-6">
                             <SheetTitle>Editor Tools</SheetTitle>
                             <SheetDescription>
                               Select a tool to modify your document
                             </SheetDescription>
                           </SheetHeader>
                           <div className="space-y-8">
                             <div className="p-1">
                               <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 px-1">Main Toolbar</h3>
                               <EditorToolbar 
                                 activeTool={activeTool} 
                                 onToolSelect={(tool) => {
                                   handleToolSelect(tool)
                                   setIsSheetOpen(false)
                                 }} 
                                 canUndo={historyIndex > 0}
                                 canRedo={historyIndex < history.length - 1}
                                 onUndo={handleUndo}
                                 onRedo={handleRedo}
                                 onAction={() => setIsSheetOpen(false)}
                               />
                             </div>
                             <SidebarTools
                               savedSignature={savedSignature}
                               setSavedSignature={setSavedSignature}
                               savedInitials={savedInitials}
                               setSavedInitials={setSavedInitials}
                               setSignatureMode={setSignatureMode}
                               setShowSignatureModal={setShowSignatureModal}
                               setPendingContent={setPendingContent}
                               handleToolSelect={handleToolSelect}
                               downloadSignedDocument={downloadSignedDocument}
                               isProcessing={isProcessing}
                               elements={elements}
                               handleClearFile={handleClearFile}
                               selectedElementId={selectedElementId}
                               setSelectedElementId={setSelectedElementId}
                               handleRemoveElement={handleRemoveElement}
                               onAction={() => setIsSheetOpen(false)}
                             />
                           </div>
                         </SheetContent>
                       </Sheet>

                       <Button 
                         onClick={downloadSignedDocument}
                         disabled={elements.length === 0 || isProcessing}
                         className="h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 px-4 shadow-lg shadow-indigo-500/20"
                       >
                         {isProcessing ? (
                           <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                         ) : (
                           <>
                             <Download size={18} />
                             <span className="hidden sm:inline">Download</span>
                           </>
                         )}
                       </Button>
                     </div>

                     <div className="hidden xs:flex px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold text-slate-500 items-center gap-2">
                       <CheckCircle2 size={14} className="text-emerald-500" />
                       <span className="hidden sm:inline">Encrypted Secure Session</span>
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

      {showTextModal && (
        <TextModal
          onSave={handleTextSave}
          onCancel={() => setShowTextModal(false)}
        />
      )}

      {showDateModal && (
        <DateModal
          onSave={handleDateSave}
          onCancel={() => setShowDateModal(false)}
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
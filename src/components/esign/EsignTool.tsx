"use client"

import React, { useState, useCallback, useRef, useEffect } from "react"
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
import { uploadSignedDocumentAction, getDocumentByShareCodeAction } from "@/app/actions/documents"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useUser } from "@clerk/nextjs"
import { supabase } from "@/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"
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
  Menu,
  Hash
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
import { Input } from "../ui/input"

interface EsignToolProps {
  initialDocLimit?: number
  initialDocCount?: number
}

export function EsignTool({ initialDocLimit = 0, initialDocCount = 0 }: EsignToolProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const claimCode = searchParams.get("claim")
  const [file, setFile] = useState<File | null>(null)
  const [activeTool, setActiveTool] = useState<ElementType | null>(null)
  const [elements, setElements] = useState<PlacedElement[]>([])
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [pageNumber, setPageNumber] = useState(1)
  const [joinCode, setJoinCode] = useState("")
  const [uploadedAt, setUploadedAt] = useState<string | null>(null)
  const [signedAt, setSignedAt] = useState<string | null>(null)

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

  // Plan & Usage State
  const { user } = useUser()
  const [docLimit, setDocLimit] = useState<number>(initialDocLimit)
  const [docCount, setDocCount] = useState<number>(initialDocCount)
  const [isPlanLoading, setIsPlanLoading] = useState(true)

  const fetchPlanAndUsage = useCallback(async () => {
    if (!user || !supabase) return
    try {
      const { data: userData } = await supabase
        .from("users")
        .select("id, document_limit, is_premium")
        .eq("clerk_id", user.id)
        .single()

      if (userData) {
        setDocLimit(userData.document_limit || 0)
        const { count } = await supabase
          .from("documents")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userData.id)
        setDocCount(count || 0)
      }
    } catch (error) {
      console.error("Error fetching usage stats:", error)
    } finally {
      setIsPlanLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchPlanAndUsage()
  }, [fetchPlanAndUsage])

  // Handle shared document claim
  useEffect(() => {
    const handleClaim = async () => {
      if (!claimCode || file) return

      // Check document limit before loading
      if (docLimit <= 0 && !isPlanLoading) {
        toast.error("Plan Limit Reached", {
          description: "Please upgrade to Pro to sign shared documents.",
        })
        router.replace("/esign")
        return
      }

      setIsProcessing(true)
      try {
        const result = await getDocumentByShareCodeAction(claimCode)
        if (result.success && result.data) {
          const doc = result.data
          // Fetch the file from Cloudinary and convert to a File object
          const response = await fetch(doc.secure_url)
          const blob = await response.blob()
          const claimedFile = new File([blob], doc.file_name, { type: doc.file_type })

          setFile(claimedFile)
          setUploadedAt(new Date().toISOString()) // Track claim/upload time
          toast.success("Shared document loaded!")
        } else {
          toast.error(result.error || "Could not load shared document")
          // Clear the search param if it's invalid
          router.replace("/esign")
        }
      } catch (error) {
        console.error("Claim error:", error)
        toast.error("An error occurred while loading the shared document")
      } finally {
        setIsProcessing(false)
      }
    }

    handleClaim()
  }, [claimCode, file, router])

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
    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"]
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Invalid file format", {
        description: "Only PDF, JPG, and PNG are supported.",
      })
      return
    }

    // NEW: Check document limit
    if (docLimit <= 0) {
      toast.error("Plan Limit Reached", {
        description: "You have used all documents in your plan or are on a Free plan. Please upgrade to Pro for unlimited signing.",
        duration: 5000,
      })
      return
    }

    setFile(selectedFile)
    setUploadedAt(new Date().toISOString()) // Track manual upload time
    setElements([])
    setHistory([[]])
    setHistoryIndex(0)
    setPageNumber(1)
    toast.success("Document uploaded successfully!")
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

  // Replace handleSignatureSave in EsignTool.tsx

  const handleSignatureSave = (dataUrl: string) => {
    if (signatureMode === "signature") {
      setSavedSignature(dataUrl)
    } else {
      setSavedInitials(dataUrl)
    }
    setShowSignatureModal(false)

    // Load image to get natural dimensions
    const img = new Image()
    img.onload = () => {
      const type = signatureMode === "signature" ? "signature" : "initials"

      // Calculate smart sizing
      const maxWidth = 350 // Maximum width for signatures
      const maxHeight = 120 // Maximum height

      let width = img.width
      let height = img.height

      // Scale down if too large, but maintain aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const widthScale = maxWidth / width
        const heightScale = maxHeight / height
        const scale = Math.min(widthScale, heightScale)
        width = width * scale
        height = height * scale
      }

      // Ensure minimum size for usability
      const minWidth = 80
      const minHeight = 30
      if (width < minWidth) {
        const scale = minWidth / width
        width = minWidth
        height = height * scale
      }

      handleAddElement({
        type,
        content: dataUrl,
        x: 100,
        y: signatureMode === "signature" ? 100 : 150,
        width,
        height,
        pageNumber,
      })

      toast.success(`${signatureMode === "signature" ? "Signature" : "Initials"} saved and added!`)
    }
    img.onerror = () => {
      // Fallback to default size if image load fails
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
    img.src = dataUrl
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
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"]
      if (!allowedTypes.includes(imgFile.type)) {
        toast.error("Invalid image format. Only JPG and PNG are allowed.", {
          description: "Please upload a supported image format.",
        })
        return
      }

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
      reader.onerror = () => {
        toast.error("Failed to read image file.")
      }
      reader.readAsDataURL(imgFile)
    }
    e.target.value = ""
  }

  const handleAddElement = useCallback((element: Omit<PlacedElement, "id">) => {
    // Track first signature/content application
    if (!signedAt) {
      setSignedAt(new Date().toISOString())
    }

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

        // Get the actual canvas element and its VISUAL dimensions (not pixel dimensions)
        const canvasElement = document.querySelector('canvas') as HTMLCanvasElement
        if (!canvasElement) {
          toast.error("Download failed", {
            description: "Could not find the document canvas. Please refresh and try again.",
          })
          return
        }

        // CRITICAL: Use getBoundingClientRect for visual dimensions, not canvas.width/height
        const canvasRect = canvasElement.getBoundingClientRect()
        const visualWidth = canvasRect.width
        const visualHeight = canvasRect.height

        console.log('=== PDF EXPORT DEBUG ===')
        console.log('Canvas pixel dimensions:', canvasElement.width, 'x', canvasElement.height)
        console.log('Canvas VISUAL dimensions:', visualWidth, 'x', visualHeight)
        console.log('Device pixel ratio:', window.devicePixelRatio)

        // Group elements by page
        const elementsByPage = elements.reduce((acc, el) => {
          if (!acc[el.pageNumber]) acc[el.pageNumber] = []
          acc[el.pageNumber].push(el)
          return acc
        }, {} as Record<number, PlacedElement[]>)

        for (const [pageNum, pageElements] of Object.entries(elementsByPage)) {
          const pageIndex = parseInt(pageNum) - 1
          const page = pages[pageIndex]
          if (!page) continue

          const { width: pdfWidth, height: pdfHeight } = page.getSize()

          // CRITICAL FIX: Calculate scale using VISUAL dimensions, not pixel dimensions
          // Elements are positioned relative to VISUAL canvas size
          const scaleX = pdfWidth / visualWidth
          const scaleY = pdfHeight / visualHeight

          console.log('PDF dimensions:', pdfWidth, 'x', pdfHeight)
          console.log('Scale factors:', scaleX, 'x', scaleY)

          for (const el of pageElements) {
            // Convert VISUAL canvas coordinates to PDF coordinates
            const pdfX = el.x * scaleX
            const pdfY = pdfHeight - (el.y * scaleY) - (el.height * scaleY)
            const pdfW = el.width * scaleX
            const pdfH = el.height * scaleY

            console.log('Element:', el.type)
            console.log('Visual coords:', { x: el.x, y: el.y, w: el.width, h: el.height })
            console.log('PDF coords:', { x: pdfX, y: pdfY, w: pdfW, h: pdfH })

            if (el.type === "signature" || el.type === "initials" || el.type === "image") {
              try {
                // Create a temporary canvas to render the signature at the exact size it appears
                const tempCanvas = document.createElement('canvas')
                const tempCtx = tempCanvas.getContext('2d')
                if (!tempCtx) continue

                // Set canvas to exact PDF dimensions for this element
                const resolution = 3 // 3x for quality
                tempCanvas.width = pdfW * resolution
                tempCanvas.height = pdfH * resolution

                // Load the signature image
                const img = new Image()
                img.crossOrigin = 'anonymous'

                await new Promise<void>((resolve, reject) => {
                  img.onload = () => {
                    // Draw image to fill the entire canvas
                    tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height)
                    resolve()
                  }
                  img.onerror = reject
                  img.src = el.content
                })

                // Convert to PNG bytes
                const dataUrl = tempCanvas.toDataURL('image/png')
                const base64Data = dataUrl.split(',')[1]
                const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))

                // Embed in PDF
                const pdfImage = await pdfDoc.embedPng(imageBytes)

                page.drawImage(pdfImage, {
                  x: pdfX,
                  y: pdfY,
                  width: pdfW,
                  height: pdfH,
                })
              } catch (err) {
                console.error("Error embedding image:", err)
              }
            } else if (el.type === "text" || el.type === "date") {
              const font = await pdfDoc.embedFont("Helvetica")
              const fontSize = (el.fontSize || 14) * scaleY

              page.drawText(el.content, {
                x: pdfX + (5 * scaleX),
                y: pdfY + (pdfH / 2) - (fontSize / 3),
                size: fontSize,
                font,
                color: rgb(0, 0, 0),
              })
            } else if (el.type === "checkbox") {
              page.drawRectangle({
                x: pdfX,
                y: pdfY,
                width: pdfW,
                height: pdfH,
                borderColor: rgb(0.2, 0.2, 0.2),
                borderWidth: 2,
              })

              if (el.checked) {
                const checkSize = Math.min(pdfW, pdfH) * 0.6
                const centerX = pdfX + pdfW / 2
                const centerY = pdfY + pdfH / 2

                page.drawLine({
                  start: { x: centerX - checkSize / 3, y: centerY },
                  end: { x: centerX - checkSize / 6, y: centerY - checkSize / 3 },
                  thickness: 2.5,
                  color: rgb(0.2, 0.4, 0.8),
                })
                page.drawLine({
                  start: { x: centerX - checkSize / 6, y: centerY - checkSize / 3 },
                  end: { x: centerX + checkSize / 3, y: centerY + checkSize / 3 },
                  thickness: 2.5,
                  color: rgb(0.2, 0.4, 0.8),
                })
              }
            }
          }
        }

        const pdfBytes = await pdfDoc.save()
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" })

        // --- NEW: Sync to Cloudinary & DB ---
        const signedFile = new File([blob], `signed_${file.name}`, { type: "application/pdf" })
        const formData = new FormData()
        formData.append("file", signedFile)

        // Pass claimant info if any
        if (claimCode) {
          formData.append("shareCode", claimCode)
          const fullName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "Collaborator"
          formData.append("signedByName", fullName)
        }

        if (uploadedAt) formData.append("uploadedAt", uploadedAt)
        if (signedAt) formData.append("signedAt", signedAt)

        const syncResult = await uploadSignedDocumentAction(formData)
        if (!syncResult.success) {
          console.error("Cloudinary Sync Error:", syncResult.error)
          toast.error("Cloudinary Sync Failed", {
            description: "Your file downloaded but couldn't be saved to history.",
          })
        } else {
          // Refresh usage stats after successful sync
          fetchPlanAndUsage()
        }
        // ------------------------------------

        saveAs(blob, `signed_${file.name}`)
      } else {
        // Image handling
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          toast.error("Download failed", {
            description: "The document processor could not be initialized.",
          })
          return
        }

        const img = new Image()
        const url = URL.createObjectURL(file)

        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = url
        })

        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        const canvasElement = document.querySelector('canvas') as HTMLCanvasElement
        const canvasRect = canvasElement?.getBoundingClientRect()
        const visualWidth = canvasRect?.width || img.width
        const visualHeight = canvasRect?.height || img.height

        const scaleX = img.width / visualWidth
        const scaleY = img.height / visualHeight

        for (const el of elements.filter(e => e.pageNumber === 1)) {
          const x = el.x * scaleX
          const y = el.y * scaleY
          const w = el.width * scaleX
          const h = el.height * scaleY

          if (el.type === "signature" || el.type === "initials" || el.type === "image") {
            const sigImg = new Image()
            await new Promise<void>((resolve) => {
              sigImg.onload = () => {
                ctx.drawImage(sigImg, x, y, w, h)
                resolve()
              }
              sigImg.onerror = () => resolve()
              sigImg.src = el.content
            })
          } else if (el.type === "text" || el.type === "date") {
            const fontSize = (el.fontSize || 16) * scaleY
            ctx.font = `${fontSize}px ${el.fontFamily || "Arial"}`
            ctx.fillStyle = el.color || "#000"
            ctx.textBaseline = "middle"
            ctx.fillText(el.content, x + 5 * scaleX, y + h / 2)
          } else if (el.type === "checkbox") {
            ctx.strokeStyle = "#333"
            ctx.lineWidth = 2
            ctx.strokeRect(x, y, w, h)

            if (el.checked) {
              ctx.strokeStyle = "#3366cc"
              ctx.lineWidth = 3
              ctx.beginPath()
              ctx.moveTo(x + w * 0.2, y + h * 0.5)
              ctx.lineTo(x + w * 0.4, y + h * 0.7)
              ctx.lineTo(x + w * 0.8, y + h * 0.3)
              ctx.stroke()
            }
          }
        }

        URL.revokeObjectURL(url)

        canvas.toBlob(async (blob) => {
          if (blob) {
            // --- NEW: Sync to Cloudinary & DB ---
            const fileName = `signed_${file.name.replace(/\.[^/.]+$/, "")}.png`
            const signedFile = new File([blob], fileName, { type: "image/png" })
            const formData = new FormData()
            formData.append("file", signedFile)

            if (claimCode) {
              formData.append("shareCode", claimCode)
              const fullName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "Collaborator"
              formData.append("signedByName", fullName)
            }

            if (uploadedAt) formData.append("uploadedAt", uploadedAt)
            if (signedAt) formData.append("signedAt", signedAt)

            const syncResult = await uploadSignedDocumentAction(formData)
            if (!syncResult.success) {
              console.error("Cloudinary Sync Error:", syncResult.error)
              toast.error("Cloudinary Sync Failed", {
                description: "Your file downloaded but couldn't be saved to history.",
              })
            } else {
              // Refresh usage stats after successful sync
              fetchPlanAndUsage()
            }
            // ------------------------------------

            saveAs(blob, fileName)
          } else {
            toast.error("Download failed", {
              description: "Could not generate the signed image file.",
            })
          }
        }, "image/png")
      }

      toast.success("Document signed and downloaded!")

      // Redirect to refresh the tool for a new document
      setTimeout(() => {
        window.location.href = "/esign"
      }, 1500)
    } catch (error) {
      console.error("Error saving document:", error)
      toast.error("Failed to download document", {
        description: "An unexpected error occurred while preparing your file. Please try again.",
      })
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
        <div className="max-w-3xl mx-auto w-full pt-10 relative">
          {claimCode && isProcessing && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md rounded-[3.5rem] animate-in fade-in duration-500">
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <div className="h-20 w-20 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                  <Hash className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={24} />
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-slate-900 dark:text-white">Fetching Shared Document</p>
                  <p className="text-slate-500 font-medium mt-1">Ref: {claimCode}</p>
                </div>
              </div>
            </div>
          )}
          <div className="text-center mb-12">
            <div className="inline-flex items-center rounded-full bg-indigo-500/10 px-4 py-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-6">
              Step 1: Upload your document
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight mb-4">Start Signing Your Document</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              Drop your file below to enter the editor. We support PDF, JPG, and PNG formats.
            </p>
          </div>
          <FileUploader
            onFileSelect={handleFileSelect}
            selectedFile={file}
            onClear={handleClearFile}
          />

          <div className="mt-12 flex flex-col items-center">
            <div className="flex items-center gap-4 mb-8 w-full">
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest px-4">OR</span>
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
            </div>

            <div className="w-full max-w-md">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl shadow-indigo-500/5 group transition-all hover:shadow-indigo-500/10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                    <Hash size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Join a Document</h3>
                    <p className="text-xs text-slate-500 font-medium">Enter a reference code to sign</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Enter Code : "
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-6 font-bold text-lg tracking-wider focus:ring-indigo-500/20"
                  />
                  <Button
                    onClick={() => {
                      if (joinCode.trim()) {
                        router.push(`/esign?claim=${joinCode.toUpperCase().trim()}`)
                      }
                    }}
                    disabled={!joinCode.trim() || isProcessing}
                    className="h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/20"
                  >
                    Go
                  </Button>
                </div>
              </div>
            </div>
          </div>
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
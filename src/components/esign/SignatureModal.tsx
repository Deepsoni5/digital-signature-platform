"use client"

import React, { useRef, useEffect, useState } from "react"
import SignaturePad from "signature_pad"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Eraser, Check, Undo, PenTool, Type, Upload, Trash2, X } from "lucide-react"

interface SignatureModalProps {
  onSave: (dataUrl: string) => void
  onCancel: () => void
  mode?: "signature" | "initials"
}

const FONTS = [
  { name: "Dancing Script", style: "Dancing Script, cursive" },
  { name: "Great Vibes", style: "Great Vibes, cursive" },
  { name: "Pacifico", style: "Pacifico, cursive" },
  { name: "Caveat", style: "Caveat, cursive" },
  { name: "Alex Brush", style: "Alex Brush, cursive" },
  { name: "Satisfy", style: "Satisfy, cursive" },
]

const COLORS = [
  { name: "Black", value: "#000000" },
  { name: "Blue", value: "#0000FF" },
  { name: "Dark Blue", value: "#000080" },
  { name: "Red", value: "#FF0000" },
  { name: "Green", value: "#008000" },
  { name: "Purple", value: "#800080" },
  { name: "Indigo", value: "#4F46E5" },
  { name: "Teal", value: "#008080" },
]

export function SignatureModal({ onSave, onCancel, mode = "signature" }: SignatureModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const signaturePadRef = useRef<SignaturePad | null>(null)
  const [hasStrokes, setHasStrokes] = useState(false)
  const [typedText, setTypedText] = useState("")
  const [selectedFont, setSelectedFont] = useState(FONTS[0])
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value)
  const [activeTab, setActiveTab] = useState<"type" | "draw" | "upload">("type")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (canvasRef.current && activeTab === "draw") {
      const canvas = canvasRef.current
      signaturePadRef.current = new SignaturePad(canvas, {
        backgroundColor: "rgba(255, 255, 255, 0)",
        penColor: selectedColor,
        minWidth: 1,
        maxWidth: 3,
      })

      const resizeCanvas = () => {
        const ratio = Math.max(window.devicePixelRatio || 1, 1)
        const rect = canvas.getBoundingClientRect()

        // Increase resolution by 2x for better quality
        canvas.width = rect.width * ratio * 2
        canvas.height = rect.height * ratio * 2

        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.scale(ratio * 2, ratio * 2)
        }

        // Reinitialize signature pad with new dimensions
        if (signaturePadRef.current) {
          signaturePadRef.current.clear()
        }
        setHasStrokes(false)
      }

      resizeCanvas()
      window.addEventListener("resize", resizeCanvas)

      signaturePadRef.current.onEnd = () => {
        setHasStrokes(true)
      }

      return () => {
        window.removeEventListener("resize", resizeCanvas)
      }
    }
  }, [activeTab, selectedColor])


  const handleClear = () => {
    signaturePadRef.current?.clear()
    setHasStrokes(false)
  }

  const handleUndo = () => {
    const data = signaturePadRef.current?.toData()
    if (data && data.length > 0) {
      data.pop()
      signaturePadRef.current?.fromData(data)
      setHasStrokes(data.length > 0)
    }
  }

  const handleSaveTyped = () => {
    if (!typedText.trim()) return

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Use high resolution for quality
    const scale = 3
    const baseFontSize = mode === "initials" ? 40 : 48
    const fontSize = baseFontSize * scale

    ctx.font = `${fontSize}px ${selectedFont.style}`
    const metrics = ctx.measureText(typedText)

    // Calculate canvas size based on actual text dimensions
    const padding = 20 * scale
    canvas.width = metrics.width + padding * 2
    canvas.height = fontSize * 1.5 + padding * 2

    // Redraw with proper settings
    ctx.font = `${fontSize}px ${selectedFont.style}`
    ctx.fillStyle = selectedColor
    ctx.textBaseline = "middle"
    ctx.textAlign = "center"
    ctx.fillText(typedText, canvas.width / 2, canvas.height / 2)

    // Return both the data URL and the natural dimensions
    const dataUrl = canvas.toDataURL("image/png")
    const naturalWidth = canvas.width / scale
    const naturalHeight = canvas.height / scale

    // Store dimensions in the data URL as metadata (we'll extract this)
    onSave(dataUrl)
  }

  const handleSaveDraw = () => {
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      const originalCanvas = canvasRef.current
      if (!originalCanvas) return

      // Get the bounds of the actual signature (trim empty space)
      const imageData = originalCanvas.getContext('2d')?.getImageData(0, 0, originalCanvas.width, originalCanvas.height)
      if (!imageData) return

      // Find bounding box of non-transparent pixels
      let minX = originalCanvas.width, minY = originalCanvas.height, maxX = 0, maxY = 0
      for (let y = 0; y < originalCanvas.height; y++) {
        for (let x = 0; x < originalCanvas.width; x++) {
          const alpha = imageData.data[(y * originalCanvas.width + x) * 4 + 3]
          if (alpha > 0) {
            if (x < minX) minX = x
            if (x > maxX) maxX = x
            if (y < minY) minY = y
            if (y > maxY) maxY = y
          }
        }
      }

      // Add padding
      const padding = 10
      minX = Math.max(0, minX - padding)
      minY = Math.max(0, minY - padding)
      maxX = Math.min(originalCanvas.width, maxX + padding)
      maxY = Math.min(originalCanvas.height, maxY + padding)

      const cropWidth = maxX - minX
      const cropHeight = maxY - minY

      // Create high-res canvas with cropped content
      const scale = 3
      const highResCanvas = document.createElement("canvas")
      const ctx = highResCanvas.getContext("2d")
      if (!ctx) return

      highResCanvas.width = cropWidth * scale
      highResCanvas.height = cropHeight * scale

      ctx.scale(scale, scale)
      ctx.drawImage(originalCanvas, minX, minY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight)

      onSave(highResCanvas.toDataURL("image/png"))
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"]
      if (!allowedTypes.includes(file.type)) {
        toast.error("Invalid image format. Only JPG and PNG are allowed.", {
          description: " Please upload a supported signature image.",
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string)
      }
      reader.onerror = () => {
        toast.error("Failed to read image file.")
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveUpload = () => {
    if (uploadedImage) {
      onSave(uploadedImage)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl rounded-3xl bg-background shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b bg-muted/30">
          <h2 className="text-2xl font-bold">
            {mode === "initials" ? "Add Your Initials" : "Add Your Signature"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Type, draw or upload your {mode === "initials" ? "initials" : "signature"}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="p-6">
          <TabsList className="grid w-full grid-cols-3 mb-8 h-12">
            <TabsTrigger value="type" className="flex items-center gap-2 rounded-lg">
              <Type size={18} /> Type
            </TabsTrigger>
            <TabsTrigger value="draw" className="flex items-center gap-2 rounded-lg">
              <PenTool size={18} /> Draw
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2 rounded-lg">
              <Upload size={18} /> Upload
            </TabsTrigger>
          </TabsList>

          {/* Color Selection (Common for Type and Draw) */}
          {(activeTab === "type" || activeTab === "draw") && (
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Color:</span>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color.value)}
                    className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${selectedColor === color.value ? "border-indigo-600 scale-110 ring-2 ring-indigo-200" : "border-transparent"
                      }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          )}

          <TabsContent value="type" className="space-y-6">
            <Input
              placeholder={mode === "initials" ? "Type initials (e.g., JD)" : "Type your full name"}
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              className="text-xl h-14 rounded-xl border-2 focus:ring-indigo-500"
              maxLength={mode === "initials" ? 5 : 50}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[240px] overflow-y-auto pr-2">
              {FONTS.map((font) => (
                <button
                  key={font.name}
                  onClick={() => setSelectedFont(font)}
                  className={`p-6 rounded-2xl border-2 transition-all text-center relative ${selectedFont.name === font.name
                    ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20"
                    : "border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800"
                    }`}
                >
                  {selectedFont.name === font.name && (
                    <div className="absolute top-2 right-2 h-4 w-4 bg-indigo-600 rounded-full flex items-center justify-center">
                      <Check size={10} className="text-white" />
                    </div>
                  )}
                  <span
                    style={{ fontFamily: font.style, color: selectedColor }}
                    className="text-2xl sm:text-3xl block truncate"
                  >
                    {typedText || (mode === "initials" ? "AB" : "John Doe")}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="ghost" size="lg" onClick={onCancel} className="rounded-xl">
                Cancel
              </Button>
              <Button
                size="lg"
                onClick={handleSaveTyped}
                disabled={!typedText.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-8"
              >
                Use Signature
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="draw" className="space-y-6">
            <div className="relative aspect-[2.5/1] w-full border-2 border-dashed rounded-2xl bg-slate-50 dark:bg-slate-900/50 overflow-hidden touch-none group">
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full cursor-crosshair"
              />
              <div className="absolute bottom-4 left-4 right-4 border-t-2 border-slate-200 dark:border-slate-800 pointer-events-none opacity-50" />
              {hasStrokes && (
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 dark:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleClear}
                >
                  <Trash2 size={14} className="text-destructive" />
                </Button>
              )}
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleUndo} disabled={!hasStrokes} className="rounded-xl">
                  <Undo className="mr-2 h-4 w-4" /> Undo
                </Button>
                <Button variant="outline" onClick={handleClear} disabled={!hasStrokes} className="rounded-xl">
                  <Eraser className="mr-2 h-4 w-4" /> Clear
                </Button>
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={onCancel} className="rounded-xl">
                  Cancel
                </Button>
                <Button size="lg" onClick={handleSaveDraw} disabled={!hasStrokes} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-8">
                  Use Signature
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <div
              className="aspect-[2.5/1] w-full border-2 border-dashed rounded-2xl bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors overflow-hidden p-4"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />

              {uploadedImage ? (
                <div className="relative h-full w-full flex items-center justify-center">
                  <img src={uploadedImage} alt="Uploaded signature" className="max-h-full max-w-full object-contain" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-0 right-0 h-8 w-8 rounded-full shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation()
                      setUploadedImage(null)
                    }}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="h-16 w-16 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                    <Upload size={32} />
                  </div>
                  <div className="text-center">
                    <p className="font-bold">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground mt-1">Supports PNG, JPG (transparent background recommended)</p>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="ghost" size="lg" onClick={onCancel} className="rounded-xl">
                Cancel
              </Button>
              <Button
                size="lg"
                onClick={handleSaveUpload}
                disabled={!uploadedImage}
                className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-8"
              >
                Use Signature
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Load Google Fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Alex+Brush&family=Caveat:wght@400;700&family=Dancing+Script:wght@400;700&family=Great+Vibes&family=Pacifico&family=Satisfy&display=swap');
      `}</style>
    </div>
  )
}

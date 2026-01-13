"use client"

import React from "react"
import { 
  Download, 
  Trash2, 
  FileUp, 
  PenTool,
  User,
  Plus,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ElementType, PlacedElement } from "./types"

interface SidebarToolsProps {
  savedSignature: string | null
  setSavedSignature: (val: string | null) => void
  savedInitials: string | null
  setSavedInitials: (val: string | null) => void
  setSignatureMode: (mode: "signature" | "initials") => void
  setShowSignatureModal: (val: boolean) => void
  setPendingContent: (val: string | null) => void
  handleToolSelect: (tool: ElementType | null) => void
  downloadSignedDocument: () => void
  isProcessing: boolean
  elements: PlacedElement[]
  handleClearFile: () => void
  selectedElementId: string | null
  setSelectedElementId: (id: string | null) => void
  handleRemoveElement: (id: string) => void
  onAction?: () => void
}

export function SidebarTools({
  savedSignature,
  setSavedSignature,
  savedInitials,
  setSavedInitials,
  setSignatureMode,
  setShowSignatureModal,
  setPendingContent,
  handleToolSelect,
  downloadSignedDocument,
  isProcessing,
  elements,
  handleClearFile,
  selectedElementId,
  setSelectedElementId,
  handleRemoveElement,
  onAction
}: SidebarToolsProps) {
  return (
    <div className="space-y-4">
      <Card className="border-none shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] overflow-hidden">
        <CardContent className="p-6 space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Saved Assets</h3>
            <div className="grid grid-cols-1 gap-3">
              {savedSignature ? (
                <div 
                  className="group relative p-3 border-2 border-indigo-100 dark:border-indigo-900/50 rounded-2xl bg-white dark:bg-slate-950 transition-all hover:border-indigo-500 cursor-pointer"
                  onClick={() => {
                    handleToolSelect("signature")
                    onAction?.()
                  }}
                >
                  <img src={savedSignature} alt="Signature" className="h-12 w-full object-contain" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation()
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
                    onAction?.()
                  }}
                >
                  <PenTool size={18} className="text-slate-400 group-hover:text-indigo-600" />
                  <span className="text-[10px] font-bold uppercase">Add Signature</span>
                </Button>
              )}

              {savedInitials ? (
                <div 
                  className="group relative p-3 border-2 border-indigo-100 dark:border-indigo-900/50 rounded-2xl bg-white dark:bg-slate-950 transition-all hover:border-indigo-500 cursor-pointer"
                  onClick={() => {
                    handleToolSelect("initials")
                    onAction?.()
                  }}
                >
                  <img src={savedInitials} alt="Initials" className="h-10 w-full object-contain" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation()
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
                    onAction?.()
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
                onClick={() => {
                  handleToolSelect("text")
                  onAction?.()
                }}
              >
                <Plus size={16} /> Text
              </Button>
              <Button
                variant="outline"
                className="h-14 rounded-xl flex flex-col items-center justify-center gap-1 text-[10px] font-bold uppercase hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                onClick={() => {
                  handleToolSelect("date")
                  onAction?.()
                }}
              >
                <Plus size={16} /> Date
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              onClick={() => {
                downloadSignedDocument()
                onAction?.()
              }}
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
                  Download PDF
                </div>
              )}
            </Button>
            <Button 
              variant="ghost" 
              className="w-full mt-4 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl"
              onClick={() => {
                handleClearFile()
                onAction?.()
              }}
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
                  onClick={() => {
                    setSelectedElementId(el.id)
                    onAction?.()
                  }}
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
  )
}

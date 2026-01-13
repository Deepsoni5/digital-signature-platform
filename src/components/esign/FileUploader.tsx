"use client"

import React, { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { FileUp, FileText, Image as ImageIcon, X, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FileUploaderProps {
  onFileSelect: (file: File) => void
  selectedFile?: File | null
  onClear?: () => void
  isLoading?: boolean
}

export function FileUploader({ onFileSelect, selectedFile, onClear }: FileUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0])
    }
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    multiple: false,
  })

  if (selectedFile) {
    return (
      <div className="relative flex items-center justify-between rounded-3xl border-2 border-indigo-100 dark:border-indigo-900/30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="flex items-center gap-4 overflow-hidden">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
            {selectedFile.type === "application/pdf" ? (
              <FileText size={28} />
            ) : (
              <ImageIcon size={28} />
            )}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-lg font-bold tracking-tight">{selectedFile.name}</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-500">
                <CheckCircle2 size={12} /> Ready to sign
              </span>
            </div>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClear} 
          className="h-10 w-10 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <X size={20} />
        </Button>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "group relative flex cursor-pointer flex-col items-center justify-center rounded-[3rem] border-4 border-dashed p-16 transition-all duration-300",
        isDragActive 
          ? "border-indigo-500 bg-indigo-500/5 scale-[1.02]" 
          : "border-slate-200 dark:border-slate-800 hover:border-indigo-300 hover:bg-slate-50 dark:hover:bg-slate-900/50"
      )}
    >
      <input {...getInputProps()} />
      
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-150 group-hover:bg-indigo-500/30 transition-colors" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-[2rem] bg-indigo-600 text-white shadow-2xl shadow-indigo-500/40 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
          <FileUp size={48} strokeWidth={2.5} />
        </div>
      </div>
      
      <h3 className="mb-2 text-3xl font-extrabold tracking-tight">Drop your file here</h3>
      <p className="max-w-[280px] text-center text-slate-500 font-medium leading-relaxed">
        Upload your PDF or image to start signing instantly. 
        <span className="text-indigo-600 dark:text-indigo-400 font-bold ml-1">No account needed.</span>
      </p>
      
      <div className="mt-10 flex items-center gap-6">
        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <FileText size={18} className="text-red-500" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">PDF</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <ImageIcon size={18} className="text-emerald-500" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Images</span>
        </div>
      </div>

      <div className="absolute bottom-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
        <div className="h-1 w-1 rounded-full bg-slate-300" />
        Secure & Private
        <div className="h-1 w-1 rounded-full bg-slate-300" />
      </div>
    </div>
  )
}

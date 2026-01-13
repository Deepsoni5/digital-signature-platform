"use client"

import React, { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface DateModalProps {
  onSave: (date: string) => void
  onCancel: () => void
}

export function DateModal({ onSave, onCancel }: DateModalProps) {
  const now = new Date()
  
  const formats = [
    now.toLocaleDateString(), // 1/13/2026
    now.toLocaleDateString('en-GB'), // 13/01/2026
    now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }), // Jan 13, 2026
    now.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }), // January 13, 2026
    now.toISOString().split('T')[0], // 2026-01-13
  ]

  // Add ordinal suffix logic for "13th Jan 2026"
  const getOrdinalNum = (n: number) => {
    return n + (n > 0 ? ['th', 'st', 'nd', 'rd'][(n > 3 && n < 21) || n % 10 > 3 ? 0 : n % 10] : '');
  }
  
  const day = getOrdinalNum(now.getDate())
  const month = now.toLocaleDateString('en-US', { month: 'short' })
  const year = now.getFullYear()
  formats.push(`${day} ${month} ${year}`)

  const [selectedFormat, setSelectedFormat] = useState(formats[0])

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="text-indigo-600" size={20} />
            Choose Date Format
          </DialogTitle>
          <DialogDescription>
            Select how you want the date to appear on your document.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
          {formats.map((format, index) => (
            <button
              key={index}
              onClick={() => setSelectedFormat(format)}
              className={cn(
                "w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group",
                selectedFormat === format 
                  ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 shadow-sm" 
                  : "border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-900/50"
              )}
            >
              <span className="font-medium">{format}</span>
              {selectedFormat === format && <Check size={18} className="text-indigo-600" />}
            </button>
          ))}
        </div>
        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button variant="outline" onClick={onCancel} className="rounded-xl h-11">
            Cancel
          </Button>
          <Button 
            onClick={() => onSave(selectedFormat)} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 px-8 font-bold"
          >
            Use Date
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

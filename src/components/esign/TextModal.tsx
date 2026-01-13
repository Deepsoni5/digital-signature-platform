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
import { Input } from "@/components/ui/input"
import { Type } from "lucide-react"

interface TextModalProps {
  onSave: (text: string) => void
  onCancel: () => void
}

export function TextModal({ onSave, onCancel }: TextModalProps) {
  const [text, setText] = useState("")

  const handleSave = () => {
    if (text.trim()) {
      onSave(text)
    }
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Type className="text-indigo-600" size={20} />
            Add Text
          </DialogTitle>
          <DialogDescription>
            Enter the text you want to place on the document.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your text here..."
            className="h-12 rounded-xl border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave()
            }}
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onCancel} className="rounded-xl h-11">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!text.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 px-8 font-bold">
            Use Text
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

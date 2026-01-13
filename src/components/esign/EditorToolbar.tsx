"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { ElementType, TOOL_CONFIGS } from "./types"
import { 
  PenTool, 
  User, 
  Type, 
  Calendar, 
  CheckSquare, 
  Image,
  MousePointer2,
  Undo2,
  Redo2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip"

const iconMap = {
  PenTool,
  User,
  Type,
  Calendar,
  CheckSquare,
  Image,
}

interface EditorToolbarProps {
  activeTool: ElementType | null
  onToolSelect: (tool: ElementType | null) => void
  canUndo?: boolean
    canRedo?: boolean
    onUndo?: () => void
    onRedo?: () => void
    onAction?: () => void
  }
  
  export function EditorToolbar({ 
    activeTool, 
    onToolSelect,
    canUndo,
    canRedo,
    onUndo,
    onRedo,
    onAction
  }: EditorToolbarProps) {
    const tools = Object.values(TOOL_CONFIGS)
  
    return (
      <TooltipProvider>
        <div className="flex flex-wrap items-center gap-1 p-2 bg-background border rounded-2xl shadow-xl">
          {/* Selection Tool */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  onToolSelect(null)
                  onAction?.()
                }}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 p-2 sm:p-3 rounded-xl transition-all min-w-[56px] sm:min-w-[64px]",
                  activeTool === null
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <MousePointer2 size={20} />
                <span className="text-[10px] sm:text-xs font-bold">Select</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Select & Move (V)</TooltipContent>
          </Tooltip>
          
          <div className="w-px h-8 bg-border mx-1" />
          
          {/* History Controls */}
          <div className="flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-xl"
                  onClick={() => {
                    onUndo?.()
                    onAction?.()
                  }}
                  disabled={!canUndo}
                >
                  <Undo2 size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
            </Tooltip>
  
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-xl"
                  onClick={() => {
                    onRedo?.()
                    onAction?.()
                  }}
                  disabled={!canRedo}
                >
                  <Redo2 size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
            </Tooltip>
          </div>
  
          <div className="w-px h-8 bg-border mx-1 hidden sm:block" />
          
          {/* Main Tools */}
          <div className="flex flex-wrap gap-1">
            {tools.map((tool) => {
              const IconComponent = iconMap[tool.icon as keyof typeof iconMap]
              return (
                <Tooltip key={tool.type}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        onToolSelect(tool.type)
                        onAction?.()
                      }}
                      className={cn(
                      "flex flex-col items-center justify-center gap-1 p-2 sm:p-3 rounded-xl transition-all min-w-[56px] sm:min-w-[64px]",
                      activeTool === tool.type
                        ? "bg-indigo-600 text-white shadow-lg"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <IconComponent size={20} />
                    <span className="text-[10px] sm:text-xs font-bold">{tool.label}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>Add {tool.label}</TooltipContent>
              </Tooltip>
            )
          })}
        </div>
      </div>
    </TooltipProvider>
  )
}

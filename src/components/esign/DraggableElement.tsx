"use client"

import React, { useRef, useEffect, useState } from "react"
import { PlacedElement } from "./types"
import { cn } from "@/lib/utils"
import { Move, X, Check } from "lucide-react"
import { Input } from "@/components/ui/input"

interface DraggableElementProps {
  element: PlacedElement
  isSelected: boolean
  onSelect: () => void
  onUpdate: (updates: Partial<PlacedElement>) => void
  onRemove: () => void
  zoom: number
}

export function DraggableElement({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onRemove,
  zoom,
}: DraggableElementProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(element.content)

  useEffect(() => {
    if (element.type === "text" && !element.content && isSelected) {
      setIsEditing(true)
    }
  }, [element.type, element.content, isSelected])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return
    e.preventDefault()
    e.stopPropagation()
    onSelect()
    setIsDragging(true)
    setDragStart({
      x: e.clientX / zoom - element.x,
      y: e.clientY / zoom - element.y,
    })
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isEditing) return
    e.stopPropagation()
    onSelect()
    const touch = e.touches[0]
    setIsDragging(true)
    setDragStart({
      x: touch.clientX / zoom - element.x,
      y: touch.clientY / zoom - element.y,
    })
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX / zoom - dragStart.x
        const newY = e.clientY / zoom - dragStart.y
        onUpdate({
          x: newX,
          y: newY
        })
      }
      if (isResizing) {
        const rect = elementRef.current?.parentElement?.getBoundingClientRect()
        if (rect) {
          const newWidth = Math.max(20, (e.clientX - rect.left) / zoom - element.x)
          const newHeight = Math.max(20, (e.clientY - rect.top) / zoom - element.y)
          onUpdate({
            width: newWidth,
            height: newHeight
          })
        }
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0]
      if (isDragging) {
        const newX = touch.clientX / zoom - dragStart.x
        const newY = touch.clientY / zoom - dragStart.y
        onUpdate({
          x: newX,
          y: newY
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
    }

    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
      window.addEventListener("touchmove", handleTouchMove)
      window.addEventListener("touchend", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", handleMouseUp)
    }
  }, [isDragging, isResizing, dragStart, element, onUpdate, zoom])

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
  }

  const handleCheckboxToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    onUpdate({ checked: !element.checked })
  }

  const handleSaveEdit = () => {
    onUpdate({ content: editValue })
    setIsEditing(false)
  }

  const renderContent = () => {
    switch (element.type) {
      case "signature":
      case "initials":
      case "image":
        return (
          <img
            src={element.content}
            alt={element.type}
            className="w-full h-full object-contain pointer-events-none"
            draggable={false}
          />
        )
      case "text":
      case "date":
        if (isEditing) {
          return (
            <div className="w-full h-full flex items-center gap-1 p-1" onClick={(e) => e.stopPropagation()}>
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="h-full text-sm border-0 focus-visible:ring-0 bg-transparent"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveEdit()
                  if (e.key === "Escape") setIsEditing(false)
                }}
              />
              <button
                onClick={handleSaveEdit}
                className="h-6 w-6 bg-indigo-600 text-white rounded flex items-center justify-center shrink-0"
              >
                <Check size={14} />
              </button>
            </div>
          )
        }
        return (
          <div
            className="w-full h-full flex items-center px-2 text-sm font-medium cursor-text"
            onDoubleClick={() => setIsEditing(true)}
            style={{
              fontSize: (element.fontSize || 14) * zoom,
              fontFamily: element.fontFamily || "Arial",
              color: element.color || "#000"
            }}
          >
            {element.content || (element.type === "text" ? "Type something..." : "Select date")}
          </div>
        )
      case "checkbox":
        return (
          <button
            onClick={handleCheckboxToggle}
            className={cn(
              "w-full h-full border-2 rounded flex items-center justify-center transition-colors",
              element.checked
                ? "bg-indigo-600 border-indigo-600 text-white"
                : "bg-white border-slate-400"
            )}
          >
            {element.checked && <Check size={element.width * 0.6} strokeWidth={3} />}
          </button>
        )
      default:
        return null
    }
  }

  return (
    <div
      ref={elementRef}
      className={cn(
        "absolute group touch-none select-none",
        isDragging && "cursor-grabbing",
        !isDragging && "cursor-grab"
      )}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        zIndex: isSelected ? 50 : 10,
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={cn(
        "w-full h-full overflow-hidden transition-all",
        (element.type === "signature" || element.type === "initials" || element.type === "image") && "bg-transparent",
        (element.type === "text" || element.type === "date") && "rounded bg-white/50 backdrop-blur-sm",
        element.type === "checkbox" && "bg-transparent",
        isSelected ? "border-2 border-indigo-500 shadow-xl shadow-indigo-500/20" : "border border-transparent group-hover:border-indigo-300"
      )}>
        {renderContent()}
      </div>

      {isSelected && !isEditing && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-[60]"
          >
            <X size={14} />
          </button>

          <div className="absolute -top-3 -left-3 h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg z-[60]">
            <Move size={12} />
          </div>

          {element.type !== "checkbox" && (
            <div
              onMouseDown={handleResizeStart}
              className="absolute -bottom-2 -right-2 h-5 w-5 rounded-full bg-indigo-600 cursor-se-resize shadow-lg z-[60] flex items-center justify-center"
            >
              <div className="w-2 h-2 border-r-2 border-b-2 border-white" />
            </div>
          )}
        </>
      )}
    </div>
  )
}
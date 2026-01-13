export type ElementType = "signature" | "initials" | "text" | "date" | "checkbox" | "image"

export interface PlacedElement {
  id: string
  type: ElementType
  x: number
  y: number
  pageNumber: number
  width: number
  height: number
  content: string
  fontSize?: number
  fontFamily?: string
  color?: string
  checked?: boolean
}

export interface ToolConfig {
  type: ElementType
  label: string
  icon: string
  defaultWidth: number
  defaultHeight: number
}

export const TOOL_CONFIGS: Record<ElementType, ToolConfig> = {
  signature: {
    type: "signature",
    label: "Signature",
    icon: "PenTool",
    defaultWidth: 200,
    defaultHeight: 80,
  },
  initials: {
    type: "initials",
    label: "Initials",
    icon: "User",
    defaultWidth: 80,
    defaultHeight: 50,
  },
  text: {
    type: "text",
    label: "Text",
    icon: "Type",
    defaultWidth: 200,
    defaultHeight: 32,
  },
  date: {
    type: "date",
    label: "Date",
    icon: "Calendar",
    defaultWidth: 140,
    defaultHeight: 32,
  },
  checkbox: {
    type: "checkbox",
    label: "Checkbox",
    icon: "CheckSquare",
    defaultWidth: 24,
    defaultHeight: 24,
  },
  image: {
    type: "image",
    label: "Image",
    icon: "Image",
    defaultWidth: 150,
    defaultHeight: 150,
  },
}

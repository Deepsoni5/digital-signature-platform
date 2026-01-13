"use client"

import dynamic from "next/dynamic"

const EsignTool = dynamic(
  () => import("./EsignTool").then(mod => mod.EsignTool),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <span className="text-lg font-medium text-slate-500">Loading Editor...</span>
        </div>
      </div>
    )
  }
)

export function EsignToolWrapper() {
  return <EsignTool />
}

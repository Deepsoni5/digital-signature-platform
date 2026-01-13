import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { EsignToolWrapper } from "@/components/esign/EsignToolWrapper"

export default function EsignPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6 lg:py-10">
          <div className="mb-6 lg:mb-8 text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">E-Signature Editor</h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Upload your document and add signatures, text, dates, checkboxes, and more. 
              Then download your professionally signed PDF.
            </p>
          </div>
          
          <EsignToolWrapper />
        </div>
      </main>

      <Footer />
    </div>
  )
}

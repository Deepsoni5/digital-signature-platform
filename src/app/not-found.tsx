import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileQuestion, Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-6 py-24 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 scale-150 bg-indigo-500/10 blur-3xl rounded-full" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-indigo-600 text-white shadow-2xl rotate-12 transition-transform hover:rotate-0">
          <FileQuestion size={48} />
        </div>
      </div>
      
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-slate-900 dark:text-white">
        404 - Page Not Found
      </h1>
      
      <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
        The document you're looking for seems to have vanished into thin air. Let's get you back to safety.
      </p>
      
      <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
        <Button size="lg" className="rounded-2xl h-14 px-8 font-bold shadow-xl shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700" asChild>
          <Link href="/">
            <Home className="mr-2 h-5 w-5" />
            Back to Home
          </Link>
        </Button>
        <Button size="lg" variant="outline" className="rounded-2xl h-14 px-8 font-semibold border-slate-200 dark:border-slate-800" asChild>
          <Link href="/esign">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Return to Editor
          </Link>
        </Button>
      </div>
      
      <div className="mt-16 text-slate-400 dark:text-slate-600 text-sm font-medium">
        Error Code: DOCUMENT_NOT_FOUND
      </div>
    </div>
  )
}

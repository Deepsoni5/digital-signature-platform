import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { EsignToolWrapper } from "@/components/esign/EsignToolWrapper"
import { currentUser } from "@clerk/nextjs/server"
import { syncUserToSupabase } from "@/lib/user-sync"
import { redirect } from "next/navigation"

export default async function EsignPage() {
  const user = await currentUser()

  if (!user) {
    redirect("/sign-in")
  }

  // Sync user to Supabase when they access the tool
  const syncResult = await syncUserToSupabase({
    clerkId: user.id,
    email: user.emailAddresses[0].emailAddress,
    fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    imageUrl: user.imageUrl,
  })

  // Get initial plan stats from the sync result
  const initialDocLimit = syncResult.success ? syncResult.data?.document_limit : 0
  const initialDocCount = syncResult.success ? syncResult.data?.document_count : 0 // Assuming you might have a count field or want to fetch it

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-6 lg:py-10">
          <div className="mb-6 lg:mb-8 text-center">
            {user ? (
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                Welcome back, {user.firstName || "User"}
              </h1>
            ) : (
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">E-Signature Editor</h1>
            )}
            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Upload your document and add signatures, text, dates, checkboxes, and more.
              Then download your professionally signed PDF.
            </p>
          </div>

          <EsignToolWrapper initialDocLimit={initialDocLimit} initialDocCount={initialDocCount} />
        </div>
      </main>

      <Footer />
    </div>
  )
}

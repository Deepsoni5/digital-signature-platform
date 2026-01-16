import { SignUp } from "@clerk/nextjs"
import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

export default function SignUpPage() {
    return (
        <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
            <Navbar />
            <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                {/* Background Decorative Elements */}
                <div className="absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[120px] dark:bg-indigo-500/5" />

                <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
                    <div className="flex justify-center mb-8">
                        <div className="flex flex-col items-center">
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">Create Account</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Join ESignVia to start signing documents</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-6 mt-4">
                        <SignUp
                            appearance={{
                                elements: {
                                    rootBox: "mx-auto shadow-2xl rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800",
                                    card: "bg-white dark:bg-slate-900 border-none shadow-none",
                                    footer: { display: "none" },
                                    headerTitle: "text-slate-900 dark:text-white",
                                    headerSubtitle: "text-slate-500 dark:text-slate-400",
                                    socialButtonsBlockButton: "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300",
                                    formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700 text-white",
                                    formFieldLabel: "text-slate-700 dark:text-slate-300",
                                    formFieldInput: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-indigo-500",
                                    dividerText: "text-slate-400 uppercase text-[10px] font-bold tracking-widest",
                                    dividerLine: "bg-slate-100 dark:bg-slate-800",
                                }
                            }}
                        />

                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
                            Already have an account?{" "}
                            <Link href="/sign-in" className="text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-700 transition-colors">
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}

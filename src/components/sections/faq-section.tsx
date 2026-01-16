"use client"

import { useState } from "react"
import { Plus, Minus, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface FAQItemProps {
    question: string
    answer: string
    isOpen: boolean
    onClick: () => void
}

function FAQItem({ question, answer, isOpen, onClick }: FAQItemProps) {
    return (
        <div
            className={cn(
                "group rounded-2xl border transition-all duration-300 overflow-hidden",
                isOpen
                    ? "border-indigo-500 bg-white dark:bg-slate-900 shadow-xl shadow-indigo-500/5"
                    : "border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:border-indigo-500/50"
            )}
        >
            <button
                onClick={onClick}
                className="flex w-full items-center justify-between p-6 text-left"
            >
                <span className={cn(
                    "text-lg font-bold transition-colors",
                    isOpen ? "text-indigo-600 dark:text-indigo-400" : "text-slate-900 dark:text-white"
                )}>
                    {question}
                </span>
                <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300",
                    isOpen ? "bg-indigo-600 text-white rotate-180" : "bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-indigo-50"
                )}>
                    {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                </div>
            </button>
            <div
                className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
            >
                <div className="overflow-hidden">
                    <p className="px-6 pb-6 text-slate-600 dark:text-slate-400 leading-relaxed">
                        {answer}
                    </p>
                </div>
            </div>
        </div>
    )
}

export function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    const faqs = [
        {
            q: "How does the document limit work on different plans?",
            a: "Our plans are designed to scale with you. The Basic plan (₹99) gives you 1 document credit for a one-time use. The Pro plan (₹999/mo) and Elite plan (₹9,999/yr) provide 'unlimited' signing (up to 99,999 documents) along with advanced features like Dashboard View and full History Access."
        },
        {
            q: "Are the signatures created on ESignVia legally binding?",
            a: "Yes, signatures created on ESignVia are legally binding in most jurisdictions worldwide, complying with major regulations such as the ESIGN Act and UETA in the US, and eIDAS in the European Union."
        },
        {
            q: "What file formats does the platform support?",
            a: "ESignVia currently supports PDF, JPG, and PNG files. Whether you're signing a formal contract or a scanned image of a form, our editor provides a consistent experience across all formats."
        },
        {
            q: "How secure is my document data?",
            a: "Security is our top priority. We use military-grade AES-256 encryption for document storage and secure SSL/TLS for all data transfers. Signed documents are stored in private, user-specific folders on Cloudinary, ensuring only you have access to your history."
        },
        {
            q: "Can I cancel my subscription at any time?",
            a: "Absolutely. You can cancel your Pro or Elite subscription anytime from your account settings. You will continue to have access to your plan features until the end of your current billing cycle."
        },
        {
            q: "What is the 'Dashboard View' and 'History Access'?",
            a: "History Access allows you to view and re-download any previously signed document from our secure storage. The Dashboard View provides a centralized interface to manage your documents, track usage, and organize your files efficiently."
        }
    ]

    return (
        <section className="py-24 relative overflow-hidden bg-slate-50 dark:bg-slate-950/50">
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="container mx-auto px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center mb-16">
                    <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 mb-4 flex items-center justify-center gap-2">
                        <HelpCircle className="h-4 w-4" /> FAQ
                    </h2>
                    <h3 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-slate-900 dark:text-white">
                        Common Questions & Answers
                    </h3>
                    <p className="mt-4 text-slate-600 dark:text-slate-400">
                        Everything you need to know about ESignVia and how it works.
                    </p>
                </div>

                <div className="mx-auto max-w-3xl space-y-4">
                    {faqs.map((faq, i) => (
                        <FAQItem
                            key={i}
                            question={faq.q}
                            answer={faq.a}
                            isOpen={openIndex === i}
                            onClick={() => setOpenIndex(openIndex === i ? null : i)}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}

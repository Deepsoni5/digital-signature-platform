import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { PricingSection } from "@/components/sections/pricing-section"
import { FAQSection } from "@/components/sections/faq-section"

export default function PricingPage() {
    return (
        <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
            <Navbar />

            <main className="flex-1">


                <PricingSection />

                {/* FAQ Section specifically for Pricing */}
                <FAQSection />
            </main>

            <Footer />
        </div>
    )
}

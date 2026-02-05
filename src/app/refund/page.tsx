import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";

export const metadata = {
  title: "Refund Policy | ESignVia",
  description: "Understand our refund, cancellation, and subscription policies.",
};

export default function RefundPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-white p-8 shadow-sm dark:bg-slate-900 sm:p-12">
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Refund Policy
            </h1>
            <p className="mb-8 text-sm text-slate-500 dark:text-slate-400">
              Last Updated: {new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <div className="prose prose-slate max-w-none dark:prose-invert">
              <h3>1. Applicability</h3>
              <p>
                This Refund Policy applies to all paid products and subscriptions offered on <Link href="https://www.esignvia.com" className="text-primary hover:underline">https://www.esignvia.com</Link>.
              </p>

              <h3>2. Subscription Fees</h3>
              <p>
                All subscription fees are billed in advance and are generally non-refundable except where required by applicable law or where explicitly stated otherwise.
              </p>

              <h3>3. Cancellation & Effective Date</h3>
              <p>
                You may cancel your subscription at any time. Cancellation takes effect at the end of the ongoing billing period. No refunds will be issued for partial or unused periods.
              </p>

              <h3>4. Exceptions (At Our Discretion)</h3>
              <p>
                In certain circumstances (e.g., technical failure preventing access to paid features), eSignvia may provide a refund or credit at our sole discretion. Any such refunds are evaluated case-by-case.
              </p>

              <h3>5. In-App Purchases</h3>
              <p>
                If you purchase a subscription through a third-party app store, their refund policies may apply. eSignvia follows the app store’s refund terms for such transactions.
              </p>

              <h3>6. Contact for Refunds</h3>
              <p>
                To request a refund or for billing questions, contact: <br />
                📧 <a href="mailto:wecare@esignvia.com" className="text-primary hover:underline">wecare@esignvia.com</a>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

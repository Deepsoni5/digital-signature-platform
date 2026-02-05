import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";

export const metadata = {
  title: "Terms of Service | ESignVia",
  description: "Read the Terms & Conditions for using ESignVia platform.",
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-white p-8 shadow-sm dark:bg-slate-900 sm:p-12">
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Terms & Conditions
            </h1>
            <p className="mb-8 text-sm text-slate-500 dark:text-slate-400">
              Last Updated: {new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <div className="prose prose-slate max-w-none dark:prose-invert">
              <h3>1. Introduction</h3>
              <p>
                Welcome to eSignvia (“we”, “us”, “our”). These Terms & Conditions (“Terms”) govern your access to and use of <Link href="https://www.esignvia.com" className="text-primary hover:underline">https://www.esignvia.com</Link> (the “Website”) and the e-signature services and related features provided (“Services”). By accessing or using the Website or Services, you agree to be bound by these Terms. If you do not agree with any part of these Terms, you must not use the Website or Services.
              </p>

              <h3>2. Eligibility</h3>
              <p>
                You must be at least 18 years old and have legal capacity to enter into these Terms. If using the service on behalf of an organization, you represent that you have authority to bind that organization.
              </p>

              <h3>3. Account Registration & Security</h3>
              <p>
                You may be required to register an account. You agree to provide accurate, current information and to maintain the confidentiality of your credentials. You are responsible for all activities under your account.
              </p>

              <h3>4. Use of Services</h3>
              <p>
                Your use of the Services must comply with all applicable laws and not infringe rights of others. Prohibited activities include unauthorized access, transmitting harmful code, or interfering with the service.
              </p>

              <h3>5. Fees & Billing</h3>
              <p>
                Certain features or Services may require payment. You agree to pay all applicable fees at the rates in effect when the fee was charged. Payment information must be accurate and complete.
              </p>

              <h3>6. Subscription Cancellations & Renewals</h3>
              <p>
                You may cancel your subscription at any time via your account settings. Subscription cancellations will take effect at the end of the current billing cycle. Unless otherwise stated, fees already paid are not refundable.
              </p>

              <h3>7. Intellectual Property</h3>
              <p>
                All content, trademarks, and materials on the Website or Services are owned by us or our licensors and are protected by applicable laws. You may not use our intellectual property without permission.
              </p>

              <h3>8. Privacy Policy</h3>
              <p>
                Our Privacy Policy, incorporated by reference, explains how we collect and use information about you. By using the Website, you agree to the practices described in that policy.
              </p>

              <h3>9. Disclaimer of Warranties</h3>
              <p>
                The Website and Services are provided “as is” and “as available” without warranties of any kind, whether express or implied.
              </p>

              <h3>10. Limitation of Liability</h3>
              <p>
                To the maximum extent permitted by law, eSignvia’s liability is limited to direct damages not exceeding the amount you paid for the Services in the 12-month period preceding the claim; eSignvia is not liable for indirect, incidental, special, or consequential damages.
              </p>

              <h3>11. Indemnification</h3>
              <p>
                You agree to indemnify and hold harmless eSignvia, its affiliates, and service providers from any losses, damages, or expenses arising from your use of the Services or violation of these Terms.
              </p>

              <h3>12. Termination</h3>
              <p>
                We may suspend or terminate your access at our discretion, with or without notice.
              </p>

              <h3>13. Governing Law & Dispute Resolution</h3>
              <p>
                These Terms shall be governed by the laws of Karnataka, India, without regard to conflict of law principles. Disputes shall be resolved in the courts of Karnataka, India.
              </p>

              <h3>14. Changes to Terms</h3>
              <p>
                We may update these Terms at any time by posting the revised Terms on the Website. Continued use of Services after changes constitutes acceptance.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

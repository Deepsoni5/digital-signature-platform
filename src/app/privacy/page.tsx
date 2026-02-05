import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata = {
  title: "Privacy Policy | ESignVia",
  description: "Learn how we collect, use, and protect your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-white p-8 shadow-sm dark:bg-slate-900 sm:p-12">
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Privacy Policy
            </h1>
            <p className="mb-8 text-sm text-slate-500 dark:text-slate-400">
              Last Updated: {new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <div className="prose prose-slate max-w-none dark:prose-invert">
              <h3>1. Introduction</h3>
              <p>
                This Privacy Policy explains how eSignvia (“we”, “us”, “our”) collects, uses, discloses, and protects personal information when you use the Website and Services. By using the Website, you consent to the practices described herein.
              </p>

              <h3>2. Information We Collect</h3>
              <p>We may collect:</p>
              <ul>
                <li><strong>Personal Data:</strong> Name, email, phone, address, payment information, signature data.</li>
                <li><strong>Usage Data:</strong> Log data, device information, IP address, cookies.</li>
                <li><strong>Service Data:</strong> Documents uploaded, signing events, audit trails.</li>
              </ul>

              <h3>3. How We Use Your Information</h3>
              <p>We use this information to:</p>
              <ul>
                <li>Provide and improve our Services.</li>
                <li>Process payments and manage subscriptions.</li>
                <li>Communicate with you (e.g., support, updates).</li>
                <li>Comply with legal obligations.</li>
              </ul>

              <h3>4. Cookies & Tracking</h3>
              <p>
                We use cookies and similar technologies to enhance your experience, analyse usage, and customize content. You can control cookie preferences via browser settings.
              </p>

              <h3>5. Sharing of Information</h3>
              <p>We may share personal information with:</p>
              <ul>
                <li>Service providers and processors (e.g., payment processors).</li>
                <li>Affiliates and business partners.</li>
                <li>Legal authorities when required.</li>
              </ul>

              <h3>6. Data Retention</h3>
              <p>
                We retain personal data only as long as necessary to fulfil purposes or comply with law.
              </p>

              <h3>7. Security</h3>
              <p>
                We implement industry-standard safeguards to protect your data but cannot guarantee absolute security.
              </p>

              <h3>8. Your Rights</h3>
              <p>
                Depending on your region (e.g., GDPR), you may have rights to access, correct, delete, or restrict processing of your personal data.
              </p>

              <h3>9. Third-Party Links</h3>
              <p>
                Our website may contain links to third-party sites. We are not responsible for their privacy practices.
              </p>

              <h3>10. Changes to Privacy Policy</h3>
              <p>
                We may update this policy, and changes will be posted with the “Last Updated” date.
              </p>

              <h3>11. Contact Us</h3>
              <p>
                If you have questions about this Privacy Policy, contact us at: <br />
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

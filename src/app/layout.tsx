import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import { ThemeProvider } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "ESignVia | Professional Electronic Signatures",
  description: "Secure, fast, and professional e-signature solutions. Sign documents, PDFs, and images with pixel-perfect precision.",
  keywords: ["e-sign", "digital signature", "sign pdf", "electronic signature", "legal documents"],
  authors: [{ name: "ESignVia Team" }],
  openGraph: {
    title: "ESignVia | Professional Electronic Signatures",
    description: "Secure, fast, and professional e-signature solutions.",
    url: "https://esignvia.com",
    siteName: "ESignVia",
    images: [
      {
        url: "/icon.svg",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ESignVia | Professional Electronic Signatures",
    description: "Secure, fast, and professional e-signature solutions.",
    images: ["/icon.svg"],
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
          <Script
            id="orchids-browser-logs"
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
            strategy="afterInteractive"
            data-orchids-project-id="8e2a5d58-2589-4b00-8a21-6cd163ed712a"
          />
          <ErrorReporter />
          <Script
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
            strategy="afterInteractive"
            data-target-origin="*"
            data-message-type="ROUTE_CHANGE"
            data-include-search-params="true"
            data-only-in-iframe="true"
            data-debug="true"
            data-custom-data='{"appName": "ESignVia", "version": "1.0.0"}'
          />
          {children}
          <Toaster position="top-center" />
          <VisualEditsMessenger />
        </ThemeProvider>
      </body>
    </html>
  );
}

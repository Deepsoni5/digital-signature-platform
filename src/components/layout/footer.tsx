import Link from "next/link"
import { Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center mb-6">
              <img
                src="/e_logo.png"
                alt="ESignVia Logo"
                className="h-28 w-auto object-contain"
              />
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              Secure, fast, and professional e-signature solutions for your documents.
              Upload, sign, and download with ease.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Contact Us</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  MADHYAVARTI SOLUTIONS PRIVATE LIMITED<br />
                  NO:8, K.NO.13-3, 28TH CROSS,<br />
                  HULIMAVU MAIN ROAD, Hulimavu,<br />
                  Bangalore South, Bangalore - 560076,<br />
                  Karnataka
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <a href="tel:+919008367818" className="hover:text-primary transition-colors">
                  +91 90083 67818
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <a href="mailto:wecare@esignvia.com" className="hover:text-primary transition-colors">
                  wecare@esignvia.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/esign" className="hover:text-primary transition-colors">E-Sign Tool</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-primary transition-colors">Refund Policy</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} ESignVia (MADHYAVARTI SOLUTIONS PRIVATE LIMITED). All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

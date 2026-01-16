import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  CheckCircle2,
  ShieldCheck,
  Zap,
  FileUp,
  PenTool,
  Download,
  Lock,
  Globe,
  Clock,
  ArrowRight,
  Plus,
  Smartphone,
  Users,
  FolderHeart,
  Bell,
  Rocket
} from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import {
  SignedIn,
  SignedOut,
  SignUpButton,
} from '@clerk/nextjs'
import { PricingSection } from "@/components/sections/pricing-section"
import { FAQSection } from "@/components/sections/faq-section"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-40">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="mx-auto max-w-7xl text-center">
              <div className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50/50 px-4 py-1.5 text-sm font-semibold text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <span className="flex h-2 w-2 rounded-full bg-indigo-600 mr-2 animate-pulse" />
                Next-Gen Electronic Signatures
              </div>
              <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-600 dark:from-white dark:via-slate-200 dark:to-indigo-400">
                Sign documents <span className="text-indigo-600 dark:text-indigo-400">smarter</span> and faster.
              </h1>
              <p className="mx-auto mt-8 max-w-2xl text-lg text-slate-600 dark:text-slate-400 sm:text-xl leading-relaxed">
                ESignVia provides the most intuitive way to upload, sign, and manage your documents. Built for speed, security, and the modern professional.
              </p>
              <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                <SignedOut>
                  <Button size="lg" className="h-14 px-10 rounded-2xl text-lg font-bold shadow-2xl shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-all hover:scale-[1.02]" asChild>
                    <Link href="/sign-up">
                      Get Started for Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </SignedOut>
                <SignedIn>
                  <Button size="lg" className="h-14 px-10 rounded-2xl text-lg font-bold shadow-2xl shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-all hover:scale-[1.02]" asChild>
                    <Link href="/esign">
                      Go to Editor
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </SignedIn>
                <Button size="lg" variant="outline" className="h-14 px-10 rounded-2xl text-lg font-semibold border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all" asChild>
                  <Link href="/contact">
                    Contact Us
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Background Decorative Elements */}
          <div className="absolute top-1/2 left-1/2 -z-10 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[120px] dark:bg-indigo-500/5" />
          <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-emerald-500/5 blur-[100px] dark:bg-emerald-500/2" />
        </section>

        {/* Security Section (New) */}
        <section className="py-24 bg-white dark:bg-slate-950 overflow-hidden">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="flex flex-col lg:flex-row items-center gap-16">
                <div className="flex-1 space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight sm:text-5xl text-slate-900 dark:text-white mb-6">
                      Total Confidence in Document Security
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                      Safe-guard sensitive information, ensure regulatory compliance, and maintain full administrative oversight.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-slate-900 dark:text-white font-semibold">
                          Protect sensitive data <span className="text-slate-500 dark:text-slate-400 font-normal">with password encryption and advanced redaction.</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-slate-900 dark:text-white font-semibold">
                          Utilize enterprise-level controls <span className="text-slate-500 dark:text-slate-400 font-normal">for user provisioning and management.</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-slate-900 dark:text-white font-semibold">
                          Support compliance <span className="text-slate-500 dark:text-slate-400 font-normal">with industry standards and regulatory requirements.</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 relative">
                  <div className="relative mx-auto w-full max-w-[500px] aspect-[4/3] bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-8 overflow-hidden">
                    {/* Document Lines Mockup */}
                    <div className="space-y-4">
                      <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-full" />
                      <div className="h-4 w-full bg-slate-100 dark:bg-slate-800/50 rounded-full" />
                      <div className="h-4 w-5/6 bg-slate-100 dark:bg-slate-800/50 rounded-full" />
                      <div className="h-4 w-4/6 bg-slate-100 dark:bg-slate-800/50 rounded-full" />
                      <div className="pt-8 space-y-4">
                        <div className="flex gap-4">
                          <div className="h-4 w-24 bg-indigo-500/20 rounded-full" />
                          <div className="h-4 w-32 bg-indigo-500/20 rounded-full" />
                        </div>
                        <div className="h-4 w-full bg-slate-100 dark:bg-slate-800/50 rounded-full" />
                      </div>
                    </div>

                    {/* Signature Box Overlay */}
                    <div className="absolute bottom-12 right-12 w-64 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border-2 border-dashed border-indigo-400/50 animate-in fade-in zoom-in duration-700 delay-300">
                      <div className="relative">
                        <svg viewBox="0 0 100 40" className="w-full h-16 text-slate-900 dark:text-white">
                          <path
                            d="M10,30 Q30,5 50,25 T90,15"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            className="animate-draw"
                          />
                        </svg>
                        <div className="absolute -top-4 -right-4 h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg animate-bounce">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                      </div>
                    </div>

                    {/* Decorative Blobs */}
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section className="py-24 border-y border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.03),transparent)] pointer-events-none" />
          <div className="container mx-auto px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="text-center mb-20">
                <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400 mb-4">The Workflow</h2>
                <h3 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-slate-900 dark:text-white">Three steps to completion</h3>
              </div>

              <div className="grid grid-cols-1 gap-12 md:grid-cols-3 relative">
                {/* Connecting Lines for Desktop */}
                <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent -translate-y-1/2 -z-10" />

                {[
                  {
                    icon: <FileUp className="h-10 w-10 text-indigo-600" />,
                    title: "Upload Document",
                    description: "Drop your PDF or image files. Our system processes them instantly for editing.",
                    number: "01"
                  },
                  {
                    icon: <PenTool className="h-10 w-10 text-indigo-600" />,
                    title: "Apply Signature",
                    description: "Draw your signature once, and place it anywhere with pixel-perfect precision.",
                    number: "02"
                  },
                  {
                    icon: <Download className="h-10 w-10 text-indigo-600" />,
                    title: "Download & Save",
                    description: "Export your document securely. We bake the signature directly into the file.",
                    number: "03"
                  }
                ].map((step, i) => (
                  <div key={i} className="flex flex-col items-center text-center group relative">
                    <div className="absolute -top-10 text-9xl font-black text-slate-100 dark:text-slate-900/40 -z-10 select-none transition-transform group-hover:-translate-y-2 duration-500">
                      {step.number}
                    </div>
                    <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-indigo-500/10 group-hover:border-indigo-500/50 shadow-lg relative z-10">
                      {step.icon}
                    </div>
                    <h4 className="mb-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {step.title}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-[280px]">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-24">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-4">Use Cases</h2>
                  <h3 className="text-4xl font-bold tracking-tight sm:text-5xl mb-8 leading-tight">Built for every <br />business scenario.</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[
                      { title: "Real Estate", icon: <Globe className="h-5 w-5" /> },
                      { title: "Legal Counsel", icon: <ShieldCheck className="h-5 w-5" /> },
                      { title: "Human Resources", icon: <Plus className="h-5 w-5" /> },
                      { title: "Sales & Finance", icon: <Zap className="h-5 w-5" /> }
                    ].map((use, i) => (
                      <div key={i} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-indigo-500 transition-colors flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600">
                          {use.icon}
                        </div>
                        <span className="font-bold">{use.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <div className="aspect-square rounded-[3rem] bg-gradient-to-br from-indigo-600 to-violet-700 p-1 shadow-2xl overflow-hidden group">
                    <div className="h-full w-full rounded-[2.8rem] bg-slate-900 overflow-hidden relative">
                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 group-hover:scale-110 transition-transform duration-1000" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                      <div className="absolute bottom-10 left-10 right-10">
                        <div className="inline-flex items-center rounded-lg bg-indigo-500/20 backdrop-blur-md px-3 py-1 text-xs font-bold text-white mb-4 border border-white/10">
                          Case Study
                        </div>
                        <p className="text-2xl font-bold text-white leading-snug">
                          "ESignVia reduced our document turnaround time from 2 days to 15 minutes."
                        </p>
                        <p className="text-indigo-300 mt-4 font-medium">— Sarah Johnson, HR Director</p>
                      </div>
                    </div>
                  </div>
                  {/* Floating elements */}
                  <div className="absolute -top-6 -right-6 h-24 w-24 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid Section (New) */}
        <section className="py-24 bg-slate-50 dark:bg-slate-950/50">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="text-center mb-16">
                <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-4">Enterprise Grade</h2>
                <h3 className="text-3xl font-bold tracking-tight sm:text-5xl">Modern Tools for Modern Teams</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    icon: <Smartphone className="h-6 w-6" />,
                    title: "Mobile Signing",
                    desc: "Sign documents on the go with our fully responsive mobile experience."
                  },
                  {
                    icon: <Users className="h-6 w-6" />,
                    title: "Team Collaboration",
                    desc: "Manage multiple users, departments, and shared document templates."
                  },
                  {
                    icon: <FolderHeart className="h-6 w-6" />,
                    title: "Smart Folders",
                    desc: "Automatically organize your signed documents with intelligent tagging."
                  },
                  {
                    icon: <Bell className="h-6 w-6" />,
                    title: "Instant Alerts",
                    desc: "Get real-time notifications when a document is viewed or signed."
                  }
                ].map((feature, i) => (
                  <div key={i} className="group p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all hover:-translate-y-1 hover:shadow-2xl shadow-indigo-500/5">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {feature.icon}
                    </div>
                    <h4 className="mb-3 text-xl font-bold tracking-tight">{feature.title}</h4>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Security & Compliance Section */}
        <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(79,70,229,0.15),transparent)] pointer-events-none" />
          <div className="container mx-auto px-6 lg:px-8 relative z-10">
            <div className="mx-auto max-w-7xl">
              <div className="flex flex-col lg:flex-row gap-16 items-center">
                <div className="lg:w-1/3">
                  <div className="h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-indigo-500/40">
                    <Lock className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-4xl font-bold mb-6">Security is our <br />core DNA.</h3>
                  <p className="text-slate-400 text-lg leading-relaxed">
                    We use military-grade AES-256 encryption for every document. Your data is never sold, and your signatures are cryptographically bound to the file.
                  </p>
                </div>
                <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {[
                    {
                      title: "Audit Trail",
                      desc: "Complete history of document actions, including IP addresses and timestamps.",
                      icon: <Clock className="h-6 w-6" />
                    },
                    {
                      title: "Tamper Evidence",
                      desc: "Any modification to the document after signing will invalidate the signature.",
                      icon: <ShieldCheck className="h-6 w-6" />
                    },
                    {
                      title: "Legally Binding",
                      desc: "Compliant with ESIGN, UETA, and eIDAS regulations worldwide.",
                      icon: <Globe className="h-6 w-6" />
                    },
                    {
                      title: "Encrypted Storage",
                      desc: "Temporary files are shredded after processing, ensuring zero residue.",
                      icon: <Lock className="h-6 w-6" />
                    }
                  ].map((feat, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 backdrop-blur-sm p-8 rounded-3xl hover:bg-white/10 transition-colors">
                      <div className="text-indigo-400 mb-4">{feat.icon}</div>
                      <h4 className="text-xl font-bold mb-3">{feat.title}</h4>
                      <p className="text-slate-400 leading-relaxed">{feat.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <PricingSection />

        {/* FAQ Section */}
        <FAQSection />

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="mx-auto max-w-7xl rounded-[3rem] bg-indigo-600 p-12 lg:p-24 text-center text-white relative shadow-2xl shadow-indigo-500/40">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)]" />
              <h2 className="text-4xl font-extrabold sm:text-6xl mb-8 relative z-10 leading-tight">
                Ready to transform <br />your document workflow?
              </h2>
              <p className="text-indigo-100 mb-12 max-w-2xl mx-auto text-xl relative z-10 leading-relaxed opacity-90">
                Join thousands of professionals who save hours every week using ESignVia. No credit card, no hassle.
              </p>
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-6">
                <SignedOut>
                  <Button size="lg" className="h-16 px-12 rounded-2xl text-xl font-bold bg-white text-indigo-600 hover:bg-slate-100 shadow-2xl transition-all hover:scale-105" asChild>
                    <Link href="/sign-up">Create Free Account</Link>
                  </Button>
                </SignedOut>
                <SignedIn>
                  <Button size="lg" className="h-16 px-12 rounded-2xl text-xl font-bold bg-white text-indigo-600 hover:bg-slate-100 shadow-2xl transition-all hover:scale-105" asChild>
                    <Link href="/esign">Open Editor</Link>
                  </Button>
                </SignedIn>
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 w-12 rounded-full border-4 border-indigo-600 bg-slate-300 flex items-center justify-center overflow-hidden">
                      <img src={`https://i.pravatar.cc/150?u=${i}`} alt="User" />
                    </div>
                  ))}
                  <div className="h-12 w-12 rounded-full border-4 border-indigo-600 bg-indigo-400 flex items-center justify-center text-xs font-bold text-white">
                    +10k
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

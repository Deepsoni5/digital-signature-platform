import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  FileUp, 
  PenTool, 
  Download,
  Layout,
  Lock,
  Globe,
  Clock,
  ArrowRight,
  Plus
} from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

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
                <Button size="lg" className="h-14 px-10 rounded-2xl text-lg font-bold shadow-2xl shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-all hover:scale-[1.02]" asChild>
                  <Link href="/esign">
                    Start Signing Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-10 rounded-2xl text-lg font-semibold border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all" asChild>
                  <Link href="/contact">
                    View Demo
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Background Decorative Elements */}
          <div className="absolute top-1/2 left-1/2 -z-10 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[120px] dark:bg-indigo-500/5" />
          <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-emerald-500/5 blur-[100px] dark:bg-emerald-500/2" />
        </section>

        {/* Workflow Section */}
        <section className="py-24 border-y border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950/50">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="text-center mb-16">
                <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-4">Process</h2>
                <h3 className="text-3xl font-bold tracking-tight sm:text-5xl">Three steps to completion</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-12 md:grid-cols-3 relative">
                {/* Connecting Lines for Desktop */}
                <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-100 dark:via-indigo-900/30 to-transparent -translate-y-1/2 -z-10" />
                
                {[
                  {
                    icon: <FileUp className="h-10 w-10 text-indigo-600" />,
                    title: "Upload Document",
                    description: "Drop your PDF or image files. Our system processes them instantly for editing."
                  },
                  {
                    icon: <PenTool className="h-10 w-10 text-indigo-600" />,
                    title: "Apply Signature",
                    description: "Draw your signature once, and place it anywhere with pixel-perfect precision."
                  },
                  {
                    icon: <Download className="h-10 w-10 text-indigo-600" />,
                    title: "Finalize & Save",
                    description: "Export your document securely. We bake the signature directly into the file."
                  }
                ].map((step, i) => (
                  <div key={i} className="flex flex-col items-center text-center group">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 transition-all group-hover:scale-110 group-hover:rotate-3 shadow-xl shadow-indigo-500/5">
                      {step.icon}
                    </div>
                    <h4 className="mb-3 text-2xl font-bold tracking-tight">{step.title}</h4>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-[280px]">{step.description}</p>
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

        {/* FAQ Section */}
        <section className="py-24 bg-slate-50 dark:bg-slate-950">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center mb-16">
              <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-4">FAQ</h2>
              <h3 className="text-3xl font-bold tracking-tight sm:text-5xl">Common Questions</h3>
            </div>
            <div className="mx-auto max-w-3xl space-y-4">
              {[
                {
                  q: "Is it free to sign documents?",
                  a: "Yes! Our basic e-sign feature is completely free for individuals and small business needs."
                },
                {
                  q: "Can I sign images like JPG or PNG?",
                  a: "Absolutely. Our platform supports PDF, JPG, and PNG formats with identical signing capabilities."
                },
                {
                  q: "Are the signatures legally valid?",
                  a: "Yes, signatures created on ESignVia are legally binding in most jurisdictions under ESIGN and eIDAS acts."
                }
              ].map((faq, i) => (
                <div key={i} className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 hover:shadow-lg transition-all">
                  <h4 className="text-lg font-bold mb-2 flex items-center justify-between">
                    {faq.q}
                    <Plus className="h-5 w-5 text-indigo-500 group-hover:rotate-45 transition-transform" />
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

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
                <Button size="lg" className="h-16 px-12 rounded-2xl text-xl font-bold bg-white text-indigo-600 hover:bg-slate-100 shadow-2xl transition-all hover:scale-105" asChild>
                  <Link href="/esign">Start Signing Now</Link>
                </Button>
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

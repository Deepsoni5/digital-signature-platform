import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ShieldCheck, Users, Globe, Zap, Heart, Award } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 lg:py-32 relative overflow-hidden">
          <div className="container mx-auto px-6 lg:px-8 relative z-10">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl mb-6">
                Our mission is to <span className="text-indigo-600">simplify</span> trust.
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                ESignVia was born out of a simple observation: signing documents shouldn't be a chore. 
                We've built a platform that combines military-grade security with an interface that anyone can use.
              </p>
            </div>
          </div>
          <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-indigo-500/5 blur-[100px]" />
        </section>

        {/* Values Section */}
        <section className="py-20 bg-white dark:bg-slate-900/50">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  icon: <ShieldCheck className="h-10 w-10 text-indigo-600" />,
                  title: "Security First",
                  description: "Every byte of data is encrypted. We prioritize your privacy above all else."
                },
                {
                  icon: <Users className="h-10 w-10 text-indigo-600" />,
                  title: "User Centric",
                  description: "We design for humans, not just for machines. Simplicity is our guiding principle."
                },
                {
                  icon: <Globe className="h-10 w-10 text-indigo-600" />,
                  title: "Global Reach",
                  description: "Our signatures are legally binding in over 180 countries worldwide."
                }
              ].map((value, i) => (
                <div key={i} className="flex flex-col items-center text-center p-8 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="mb-6">{value.icon}</div>
                  <h3 className="text-2xl font-bold mb-4">{value.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-24">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="mx-auto max-w-7xl flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2">
                <h2 className="text-3xl font-bold mb-8">The ESignVia Story</h2>
                <div className="space-y-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                  <p>
                    Started by a team of engineers and legal experts, ESignVia was created to bridge the gap 
                    between complex legal requirements and seamless digital experiences.
                  </p>
                  <p>
                    We realized that most e-signature tools were either too expensive for small businesses 
                    or too complicated for non-technical users. Our goal was to create "the third way"—a tool 
                    that is powerful, secure, and incredibly easy to use.
                  </p>
                  <p>
                    Today, we help thousands of users every day to close deals, hire talent, and manage 
                    their lives without ever needing a printer or a scanner.
                  </p>
                </div>
              </div>
              <div className="lg:w-1/2 relative">
                <div className="aspect-video rounded-3xl bg-indigo-600 overflow-hidden shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80" 
                    alt="Team collaboration" 
                    className="w-full h-full object-cover opacity-80"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-xl">
                  <Zap className="h-12 w-12" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-indigo-600 text-white">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {[
                { label: "Documents Signed", value: "1M+" },
                { label: "Happy Users", value: "50k+" },
                { label: "Countries Served", value: "180+" },
                { label: "Security Uptime", value: "99.9%" }
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-4xl lg:text-5xl font-extrabold mb-2">{stat.value}</div>
                  <div className="text-indigo-100 text-sm lg:text-base">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

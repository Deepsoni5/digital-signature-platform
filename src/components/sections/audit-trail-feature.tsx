"use client";

import { motion } from "framer-motion";
import {
    ShieldCheck,
    MapPin,
    Clock,
    MousePointer2,
    FileCheck,
    Fingerprint,
    ArrowRight,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const timelineEvents = [
    {
        time: "14:20:05",
        label: "Document Uploaded",
        desc: "Origin: Mumbai, India",
        ip: "157.34.22.10",
        icon: <FileCheck className="w-4 h-4" />,
        color: "indigo"
    },
    {
        time: "14:22:12",
        label: "Viewed by Signer",
        desc: "Device: iPhone 15 Pro",
        ip: "157.34.22.10",
        icon: <MousePointer2 className="w-4 h-4" />,
        color: "emerald"
    },
    {
        time: "14:25:30",
        label: "Signature Applied",
        desc: "Verified via Biometrics",
        ip: "157.34.22.10",
        icon: <ShieldCheck className="w-4 h-4" />,
        color: "violet"
    }
];

export function AuditTrailFeature() {
    return (
        <section className="py-24 relative overflow-hidden bg-white dark:bg-slate-950">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] -z-10" />

            <div className="container mx-auto px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                        {/* Left Side: Content */}
                        <div className="space-y-8 order-2 lg:order-1">
                            <div className="inline-flex items-center rounded-full bg-indigo-100 dark:bg-indigo-500/20 px-4 py-2 text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest shadow-sm border border-indigo-200 dark:border-indigo-500/30">
                                <Fingerprint className="mr-2 h-4 w-4" /> Bulletproof Evidence
                            </div>

                            <h2 className="text-4xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                                Every action, <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
                                    accounted for.
                                </span>
                            </h2>

                            <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl font-medium">
                                Our advanced <span className="text-slate-900 dark:text-white font-bold">Audit Trail</span> captures more than just a signature. We record the DNA of the transaction—IP addresses, geolocation, device fingerprints, and millisecond-accurate timestamps.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                                {[
                                    {
                                        title: "GPS Geolocation",
                                        text: "Know exactly where the document was signed in the world.",
                                        icon: <MapPin className="text-indigo-500" />
                                    },
                                    {
                                        title: "Precise Timeline",
                                        text: "Track the flow from initial upload to final download.",
                                        icon: <Clock className="text-emerald-500" />
                                    },
                                    {
                                        title: "Actor Verification",
                                        text: "Verified identities linked to every single modification.",
                                        icon: <ShieldCheck className="text-violet-500" />
                                    },
                                    {
                                        title: "Legal Compliance",
                                        text: "Built to satisfy ESIGN and eIDAS forensic requirements.",
                                        icon: <FileCheck className="text-orange-500" />
                                    }
                                ].map((item, i) => (
                                    <div key={i} className="group p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all">
                                        <div className="mb-3 h-10 w-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 shadow-sm">
                                            {item.icon}
                                        </div>
                                        <h4 className="font-bold text-slate-900 dark:text-white mb-1">{item.title}</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Side: Visual Mockup */}
                        <div className="relative order-1 lg:order-2">
                            <div className="relative z-10 p-1 rounded-[3.5rem] bg-gradient-to-br from-indigo-500/20 via-violet-500/20 to-emerald-500/20 backdrop-blur-3xl border border-white/20 shadow-2xl">
                                <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-200 dark:border-slate-800 shadow-inner overflow-hidden relative">

                                    {/* Mockup Header */}
                                    <div className="flex items-center justify-between mb-10">
                                        <div>
                                            <h4 className="font-black text-slate-900 dark:text-white">Activity History</h4>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Document ID: #ESV-9921</p>
                                        </div>
                                        <div className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg shadow-indigo-500/25">
                                            Verified
                                        </div>
                                    </div>

                                    {/* Interactive Timeline */}
                                    <div className="space-y-8 relative">
                                        <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800" />

                                        {timelineEvents.map((event, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -20 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.2 }}
                                                className="flex gap-6 relative group"
                                            >
                                                <div className={cn(
                                                    "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-lg border border-white/20 transition-transform group-hover:scale-110",
                                                    event.color === "indigo" ? "bg-indigo-600 text-white" :
                                                        event.color === "emerald" ? "bg-emerald-500 text-white" : "bg-violet-600 text-white"
                                                )}>
                                                    {event.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-baseline justify-between mb-1">
                                                        <span className="font-bold text-slate-900 dark:text-white">{event.label}</span>
                                                        <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded-md">
                                                            {event.time}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-4">
                                                        <span>{event.desc}</span>
                                                        <span className="font-mono opacity-50">•</span>
                                                        <span className="font-mono text-[10px] uppercase opacity-70 tracking-tighter">IP: {event.ip}</span>
                                                    </p>
                                                </div>
                                                <div className="absolute top-1/2 -right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-300">
                                                    <ChevronRight className="w-5 h-5 text-indigo-500" />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Evidence Badge Overlay */}
                                    <div className="mt-12 p-6 rounded-[2rem] bg-slate-900 text-white relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                        <div className="relative z-10 flex items-center justify-between">
                                            <div className="space-y-1">
                                                <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em]">Security Status</p>
                                                <p className="text-lg font-bold">Tamper-Proof Seal</p>
                                            </div>
                                            <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
                                                <ShieldCheck className="w-8 h-8 text-indigo-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Decorative Dots */}
                                <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-600/10 rounded-full blur-[80px]" />
                                <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-600/10 rounded-full blur-[80px]" />
                            </div>

                            {/* Verified Badge Float */}
                            <div className="absolute -top-6 -right-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-3xl shadow-2xl z-20 hidden sm:flex items-center gap-3 animate-bounce">
                                <div className="h-10 w-10 flex items-center justify-center bg-emerald-500 rounded-2xl text-white">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900 dark:text-white">Legal Grade</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ESIGN COMPLIANT</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}

function CheckCircle2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    );
}

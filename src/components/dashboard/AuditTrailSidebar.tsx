"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { format } from "date-fns"
import {
    CheckCircle2,
    Eye,
    FileUp,
    Link2,
    MousePointer2,
    Smartphone,
    Globe,
    Clock,
    User,
    ShieldCheck
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AuditLog {
    id: string
    event_type: string
    actor_name: string
    actor_email: string
    ip_address: string
    user_agent: string
    metadata: any
    created_at: string
}

interface AuditTrailSidebarProps {
    documentId: string | null
    onClose: () => void
    documentName: string
}

export function AuditTrailSidebar({ documentId, onClose, documentName }: AuditTrailSidebarProps) {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (documentId) {
            fetchLogs()
        }
    }, [documentId])

    const fetchLogs = async () => {
        setIsLoading(true)
        try {
            const { data, error } = await supabase
                .from("document_audit_logs")
                .select("*")
                .eq("document_id", documentId)
                .order("created_at", { ascending: false })

            if (error) throw error
            setLogs(data || [])
        } catch (error) {
            console.error("Error fetching audit logs:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const getEventIcon = (type: string) => {
        switch (type) {
            case 'document_uploaded':
            case 'document_created': return <FileUp className="text-blue-500" size={18} />
            case 'viewed_via_share': return <Eye className="text-amber-500" size={18} />
            case 'share_code_generated': return <Link2 className="text-purple-500" size={18} />
            case 'document_downloaded': return <CheckCircle2 className="text-emerald-500" size={18} />
            case 'personal_document_signed':
            case 'signed_via_share':
            case 'collaborator_signed':
                return <ShieldCheck className="text-emerald-500" size={18} />
            default: return <Clock className="text-slate-400" size={18} />
        }
    }

    const getEventLabel = (type: string) => {
        const labels: Record<string, string> = {
            'document_uploaded': 'Document Received & Uploaded',
            'personal_document_signed': 'Official Signature Applied',
            'signed_via_share': 'Signed via Reference Code',
            'collaborator_signed': 'Recipient Signature Verified',
            'viewed_via_share': 'Document Viewed by Recipient',
            'share_code_generated': 'Share Link Created',
            'document_downloaded': 'Signed Document Downloaded',
            'document_created': 'Document Uploaded'
        };
        return labels[type] || type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    return (
        <Sheet open={!!documentId} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-full sm:max-w-md p-0 overflow-y-auto bg-slate-50 dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800">
                <SheetHeader className="p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                            <ShieldCheck size={20} />
                        </div>
                        <SheetTitle className="text-xl font-bold">Audit Trail</SheetTitle>
                    </div>
                    <SheetDescription className="font-medium text-slate-500">
                        History for: <span className="text-slate-900 dark:text-white font-bold">{documentName}</span>
                    </SheetDescription>
                </SheetHeader>

                <div className="p-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <div className="h-10 w-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
                            <p className="text-sm font-medium text-slate-500">Retrieving logs...</p>
                        </div>
                    ) : logs.length > 0 ? (
                        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-indigo-500/50 before:via-slate-200 before:to-transparent dark:before:via-slate-800">
                            {logs.map((log, index) => (
                                <div key={log.id} className="relative flex items-start gap-6 group">
                                    <div className="absolute left-0 mt-1.5 h-10 w-10 rounded-full border-4 border-slate-50 dark:border-slate-950 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
                                        {getEventIcon(log.event_type)}
                                    </div>
                                    <div className="flex-1 ml-12 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm group-hover:shadow-md transition-all">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                            <h4 className="font-bold text-slate-900 dark:text-white">
                                                {getEventLabel(log.event_type)}
                                            </h4>
                                            <span className="text-xs font-black uppercase tracking-wider text-white bg-indigo-600 dark:bg-indigo-500 px-3 py-1 rounded-full shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-100 dark:ring-indigo-900/50">
                                                {format(new Date(log.created_at), "HH:mm:ss")}
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                                <User size={14} className="text-indigo-500" />
                                                <span className="font-bold">{log.actor_name}</span>
                                                <span className="text-[10px] text-slate-400 font-medium">({log.actor_email || 'Verified'})</span>
                                            </div>

                                            <div className="grid grid-cols-1 gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                                                <div className="flex items-center gap-2 text-[11px] font-bold">
                                                    <div className="flex items-center gap-1.5 text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                                        <Globe size={11} className="text-indigo-500" />
                                                        IP: {log.ip_address}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-100 dark:border-emerald-500/20">
                                                        <MousePointer2 size={11} />
                                                        {log.metadata?.location || 'Localhost Network'}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                                                    <Smartphone size={13} className="text-slate-400" />
                                                    <span className="text-slate-400">Device:</span>
                                                    <span className="text-slate-700 dark:text-slate-300">
                                                        {log.user_agent.includes('Windows') ? 'Windows Desktop' :
                                                            log.user_agent.includes('Mac') ? 'Mac OS' :
                                                                log.user_agent.includes('Android') ? 'Android Mobile' :
                                                                    log.user_agent.includes('iPhone') ? 'iPhone/iOS' : 'Desktop/Mobile'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                                {format(new Date(log.created_at), "MMMM d, yyyy")}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 mb-4">
                                <Clock size={32} />
                            </div>
                            <p className="font-bold text-slate-900 dark:text-white">No history found</p>
                            <p className="text-sm text-slate-500 mt-1">Logs will appear as actions are taken.</p>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}

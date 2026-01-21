"use client"

import { useState, useEffect, useCallback } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { supabase } from "@/lib/supabase"
import { useUser } from "@clerk/nextjs"
import {
    Search,
    Filter,
    FileText,
    Download,
    MoreVertical,
    ExternalLink,
    Trash2,
    Calendar,
    Layers,
    Clock,
    ArrowUpDown,
    FileCheck,
    Plus,
    Share2,
    Copy,
    Hash
} from "lucide-react"
import { generateShareCodeAction, getDocumentByShareCodeAction } from "@/app/actions/documents"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { AuditTrailSidebar } from "@/components/dashboard/AuditTrailSidebar"
import { recordDocumentDownloadAction } from "@/app/actions/documents"

interface Document {
    id: string
    file_name: string
    file_size: number
    file_type: string
    secure_url: string
    status: string
    created_at: string
    share_code?: string
    signed_by_name?: string
}

export default function DashboardPage() {
    const router = useRouter()
    const { user, isLoaded } = useUser()
    const [documents, setDocuments] = useState<Document[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [typeFilter, setTypeFilter] = useState<string>("all")
    const [referenceNumber, setReferenceNumber] = useState("")
    const [isClaiming, setIsClaiming] = useState(false)
    const [auditDocId, setAuditDocId] = useState<string | null>(null)
    const [auditDocName, setAuditDocName] = useState<string>("")

    const fetchDocuments = useCallback(async () => {
        if (!user) return
        setIsLoading(true)
        try {
            // 1. Get internal user ID and plan status
            const { data: userData } = await supabase
                .from("users")
                .select("id, plan_name")
                .eq("clerk_id", user.id)
                .single()

            const allowedPlans = ["Pro", "pro", "Elite", "elite"]
            if (!userData || !allowedPlans.includes(userData.plan_name)) {
                toast.error("Upgrade to Pro or Elite", {
                    description: "The Dashboard and Audit Trail features are exclusively available for Pro and Elite users.",
                })
                router.push("/pricing")
                return
            }

            if (userData) {
                // 2. Fetch documents
                const { data, error } = await supabase
                    .from("documents")
                    .select("*")
                    .eq("user_id", userData.id)
                    .order("created_at", { ascending: sortOrder === "asc" })

                if (error) throw error
                setDocuments(data || [])
            }
        } catch (error) {
            console.error("Error fetching documents:", error)
            toast.error("Failed to load documents")
        } finally {
            setIsLoading(false)
        }
    }, [user, sortOrder])

    useEffect(() => {
        if (isLoaded && user) {
            fetchDocuments()
        }
    }, [isLoaded, user, fetchDocuments])

    const handleShare = async (id: string) => {
        try {
            const result = await generateShareCodeAction(id)
            if (result.success) {
                const code = result.data.share_code
                await navigator.clipboard.writeText(code)
                setDocuments(prev => prev.map(doc => doc.id === id ? { ...doc, share_code: code } : doc))
                toast.success("Reference Number Generated!", {
                    description: `Code ${code} copied to clipboard. Share this with others to sign.`,
                })
            } else {
                toast.error(result.error || "Failed to generate share code")
            }
        } catch (error) {
            toast.error("Failed to share document")
        }
    }

    const handleClaimDocument = async () => {
        if (!referenceNumber.trim()) return
        setIsClaiming(true)
        try {
            const result = await getDocumentByShareCodeAction(referenceNumber)
            if (result.success) {
                toast.success("Document Found!", {
                    description: "Opening in editor...",
                })
                router.push(`/esign?claim=${referenceNumber.toUpperCase()}`)
            } else {
                toast.error(result.error || "Invalid Reference Number")
            }
        } catch (error) {
            toast.error("Error accessing shared document")
        } finally {
            setIsClaiming(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this document? This cannot be undone.")) return

        try {
            const { error } = await supabase
                .from("documents")
                .delete()
                .eq("id", id)

            if (error) throw error

            setDocuments(prev => prev.filter(doc => doc.id !== id))
            toast.success("Document deleted successfully")
        } catch (error) {
            console.error("Delete error:", error)
            toast.error("Failed to delete document")
        }
    }

    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes"
        const k = 1024
        const sizes = ["Bytes", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }

    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = doc.file_name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === "all" || doc.status === statusFilter
        const matchesType = typeFilter === "all" ||
            (typeFilter === "pdf" && doc.file_type.includes("pdf")) ||
            (typeFilter === "image" && (doc.file_type.includes("image") || doc.file_type.includes("jpg") || doc.file_type.includes("png") || doc.file_type.includes("jpeg")))
        return matchesSearch && matchesStatus && matchesType
    })

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
            <Navbar />

            <main className="flex-1">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 lg:py-16">
                    {/* Dashboard Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                                My Dashboard
                            </h1>
                            <p className="mt-2 text-slate-600 dark:text-slate-400">
                                Manage your signed documents and track your usage.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="relative group w-full sm:w-auto">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                                    <Hash size={18} />
                                </div>
                                <Input
                                    placeholder="Enter Code :"
                                    value={referenceNumber}
                                    onChange={(e) => setReferenceNumber(e.target.value)}
                                    className="h-12 pl-11 pr-4 w-full sm:w-56 rounded-2xl border-indigo-100 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500/20"
                                />
                                <Button
                                    onClick={handleClaimDocument}
                                    disabled={!referenceNumber || isClaiming}
                                    className="absolute right-1 top-1 bottom-1 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold"
                                >
                                    {isClaiming ? "..." : "Go"}
                                </Button>
                            </div>

                            <Button asChild className="h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 shadow-lg shadow-indigo-500/20 transition-all hover:scale-105">
                                <Link href="/esign">
                                    <Plus size={20} />
                                    Sign New Document
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <Card className="rounded-[2rem] border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                        <Layers size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Total Documents</p>
                                        <p className="text-2xl font-bold">{documents.length}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="rounded-[2rem] border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                        <FileCheck size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Completed</p>
                                        <p className="text-2xl font-bold">{documents.filter(d => d.status === "completed").length}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="rounded-[2rem] border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Last Signed</p>
                                        <p className="text-2xl font-bold">
                                            {documents[0] ? format(new Date(documents[0].created_at), "MMM d") : "None"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters & Search */}
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-8">
                        <div className="relative w-full lg:max-w-md group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                            <Input
                                placeholder="Search documents..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-14 pl-12 pr-4 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                            <Button
                                variant="outline"
                                onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
                                className="h-12 rounded-xl gap-2 font-semibold whitespace-nowrap"
                            >
                                <ArrowUpDown size={18} />
                                Sort: {sortOrder === "desc" ? "Newest" : "Oldest"}
                            </Button>

                            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                                {["all", "completed", "pending"].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all",
                                            statusFilter === status
                                                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                        )}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>

                            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                                {[
                                    { id: "all", label: "All Types" },
                                    { id: "pdf", label: "PDFs" },
                                    { id: "image", label: "Images" }
                                ].map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => setTypeFilter(type.id)}
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all",
                                            typeFilter === type.id
                                                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                        )}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Documents Table */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
                        {isLoading ? (
                            <div className="py-32 flex flex-col items-center justify-center space-y-4">
                                <div className="h-12 w-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
                                <p className="text-slate-500 font-medium">Loading your documents...</p>
                            </div>
                        ) : filteredDocuments.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                                            <TableHead className="w-[400px] py-6 px-8 font-bold text-slate-900 dark:text-white">Document Name</TableHead>
                                            <TableHead className="font-bold text-slate-900 dark:text-white">Status</TableHead>
                                            <TableHead className="font-bold text-slate-900 dark:text-white">Signed By</TableHead>
                                            <TableHead className="font-bold text-slate-900 dark:text-white">Size</TableHead>
                                            <TableHead className="font-bold text-slate-900 dark:text-white">Date Created</TableHead>
                                            <TableHead className="text-right py-6 px-8 font-bold text-slate-900 dark:text-white">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredDocuments.map((doc) => (
                                            <TableRow key={doc.id} className="group hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors border-b border-slate-100 dark:border-slate-800/50">
                                                <TableCell className="py-6 px-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 min-w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/10 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                            <FileText size={24} />
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <p className="font-bold text-slate-900 dark:text-white truncate max-w-[300px]">
                                                                {doc.file_name}
                                                            </p>
                                                            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                                                                {doc.file_type.split("/")[1] || "PDF"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={cn(
                                                        "rounded-full px-3 py-1 text-xs font-bold border-none",
                                                        doc.status === "completed"
                                                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                                    )}>
                                                        {doc.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-slate-500 font-medium italic">
                                                    {doc.signed_by_name || "—"}
                                                </TableCell>
                                                <TableCell className="text-slate-500 font-medium">
                                                    {formatSize(doc.file_size)}
                                                </TableCell>
                                                <TableCell className="text-slate-500 font-medium whitespace-nowrap">
                                                    {format(new Date(doc.created_at), "MMM d, yyyy")}
                                                </TableCell>
                                                <TableCell className="text-right py-6 px-4 pr-8">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <div className="flex flex-col items-center gap-1.5 min-w-[55px]">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => {
                                                                    if (doc.share_code) {
                                                                        navigator.clipboard.writeText(doc.share_code)
                                                                        toast.success("Code copied!", { description: `Reference number ${doc.share_code} is ready to share.` })
                                                                    } else {
                                                                        handleShare(doc.id)
                                                                    }
                                                                }}
                                                                className={cn(
                                                                    "h-10 w-10 border rounded-xl transition-all",
                                                                    doc.share_code
                                                                        ? "border-emerald-200 bg-emerald-50/50 text-emerald-600 hover:bg-emerald-100"
                                                                        : "border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                                                                )}
                                                                title={doc.share_code ? "Copy Reference Number" : "Enable Sharing"}
                                                            >
                                                                {doc.share_code ? <Copy size={18} /> : <Share2 size={18} />}
                                                            </Button>
                                                            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                                                                {doc.share_code ? "Copy" : "Share"}
                                                            </span>
                                                        </div>

                                                        <div className="flex flex-col items-center gap-1.5 min-w-[55px]">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => {
                                                                    setAuditDocId(doc.id)
                                                                    setAuditDocName(doc.file_name)
                                                                }}
                                                                className="h-10 w-10 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                                                                title="View Activity History"
                                                            >
                                                                <Clock size={18} />
                                                            </Button>
                                                            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">History</span>
                                                        </div>

                                                        <div className="flex flex-col items-center gap-1.5 min-w-[55px]">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                asChild
                                                                className="h-10 w-10 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                                                                onClick={() => recordDocumentDownloadAction(doc.id, doc.file_name)}
                                                            >
                                                                <a href={doc.secure_url} target="_blank" rel="noopener noreferrer">
                                                                    <Download size={18} />
                                                                </a>
                                                            </Button>
                                                            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Download</span>
                                                        </div>

                                                        <div className="flex flex-col items-center gap-1.5 min-w-[45px]">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-10 w-10 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all">
                                                                        <MoreVertical size={18} />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-52 p-2 rounded-2xl border-slate-200 dark:border-slate-800 shadow-xl">
                                                                    <DropdownMenuItem className="rounded-xl gap-2 font-medium cursor-pointer" asChild>
                                                                        <a href={doc.secure_url} target="_blank" rel="noopener noreferrer">
                                                                            <ExternalLink size={16} /> View Online
                                                                        </a>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        className="rounded-xl gap-2 font-medium cursor-pointer"
                                                                        onClick={() => {
                                                                            setAuditDocId(doc.id)
                                                                            setAuditDocName(doc.file_name)
                                                                        }}
                                                                    >
                                                                        <Clock size={16} /> Activity History
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        className="rounded-xl gap-2 font-medium cursor-pointer"
                                                                        onClick={() => {
                                                                            if (doc.share_code) {
                                                                                navigator.clipboard.writeText(doc.share_code)
                                                                                toast.success("Code copied!", { description: `Reference number ${doc.share_code} is ready to share.` })
                                                                            } else {
                                                                                handleShare(doc.id)
                                                                            }
                                                                        }}
                                                                    >
                                                                        {doc.share_code ? <Copy size={16} /> : <Share2 size={16} />}
                                                                        {doc.share_code ? "Copy Code" : "Share Document"}
                                                                    </DropdownMenuItem>
                                                                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                                                                    <DropdownMenuItem
                                                                        className="rounded-xl gap-2 font-medium text-rose-600 dark:text-rose-400 cursor-pointer focus:bg-rose-50 dark:focus:bg-rose-500/10"
                                                                        onClick={() => handleDelete(doc.id)}
                                                                    >
                                                                        <Trash2 size={16} /> Delete Permanently
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">More</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="py-32 flex flex-col items-center justify-center text-center px-6">
                                <div className="h-24 w-24 rounded-[2rem] bg-indigo-50 dark:bg-indigo-500/10 text-indigo-200 dark:text-indigo-900 flex items-center justify-center mb-8">
                                    <FileText size={48} />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">No documents found</h3>
                                <p className="text-slate-500 max-w-sm mb-10 leading-relaxed font-medium">
                                    {searchQuery
                                        ? `No documents matching "${searchQuery}" in your history.`
                                        : "You haven't signed any documents yet. Start your first document today!"}
                                </p>
                                {!searchQuery && (
                                    <Button asChild className="h-14 px-10 rounded-2xl text-lg font-bold bg-indigo-600 hover:bg-indigo-700 shadow-2xl shadow-indigo-500/20">
                                        <Link href="/esign">Sign My First Document</Link>
                                    </Button>
                                )}
                                {searchQuery && (
                                    <Button variant="ghost" onClick={() => setSearchQuery("")} className="font-bold">
                                        Clear Search
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />

            <AuditTrailSidebar
                documentId={auditDocId}
                documentName={auditDocName}
                onClose={() => setAuditDocId(null)}
            />
        </div>
    )
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ")
}

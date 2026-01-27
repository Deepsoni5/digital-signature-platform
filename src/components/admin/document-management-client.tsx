"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Loader2, FileText, Download, Eye } from "lucide-react"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface Document {
  id: string
  file_name: string
  file_size: number
  status: string
  created_at: string
  secure_url: string
  users: {
    full_name: string
    email: string
    image_url: string
  }
}

export function DocumentManagementClient() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    fetchDocuments()
  }, [page, debouncedSearch])

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search: debouncedSearch,
      })
      const res = await fetch(`/api/admin/documents?${params}`)
      const data = await res.json()
      
      if (data.data) {
        setDocuments(data.data)
        setTotalPages(data.metadata.totalPages)
      }
    } catch (error) {
      console.error("Failed to fetch documents", error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by file name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9"
        />
      </div>

      <div className="rounded-md border bg-white dark:bg-slate-950">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No documents found.
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate max-w-[200px]" title={doc.file_name}>
                            {doc.file_name}
                        </span>
                    </div>
                  </TableCell>
                  <TableCell>
                      <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                              <AvatarImage src={doc.users?.image_url} />
                              <AvatarFallback>{doc.users?.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                              <span className="text-sm font-medium">{doc.users?.full_name}</span>
                              <span className="text-xs text-muted-foreground">{doc.users?.email}</span>
                          </div>
                      </div>
                  </TableCell>
                  <TableCell>{formatFileSize(doc.file_size)}</TableCell>
                  <TableCell>
                    <Badge variant={doc.status === "completed" ? "default" : "secondary"}>
                      {doc.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(doc.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                      {doc.secure_url && (
                          <Button variant="ghost" size="icon" asChild>
                              <a href={doc.secure_url} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4" />
                              </a>
                          </Button>
                      )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
            >
                Previous
            </Button>
          </PaginationItem>
          <PaginationItem>
             <span className="text-sm text-muted-foreground px-4">
                 Page {page} of {totalPages}
             </span>
          </PaginationItem>
          <PaginationItem>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
            >
                Next
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

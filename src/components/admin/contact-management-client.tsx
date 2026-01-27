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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Loader2, MessageSquare, CheckCircle, Clock } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

interface ContactSubmission {
  id: string
  first_name: string
  last_name: string
  email: string
  subject: string
  message: string
  status: "pending" | "resolved"
  created_at: string
}

export function ContactManagementClient() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    fetchSubmissions()
  }, [page, debouncedSearch])

  const fetchSubmissions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search: debouncedSearch,
      })
      const res = await fetch(`/api/admin/contacts?${params}`)
      const data = await res.json()
      
      if (data.data) {
        setSubmissions(data.data)
        setTotalPages(data.metadata.totalPages)
      }
    } catch (error) {
      console.error("Failed to fetch submissions", error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
      setUpdating(true)
      try {
          const res = await fetch("/api/admin/contacts", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id, status })
          })

          if (!res.ok) throw new Error("Failed to update status")

          toast.success("Status updated successfully")
          fetchSubmissions()
          setSelectedSubmission(null)
      } catch (error) {
          toast.error("Failed to update status")
      } finally {
          setUpdating(false)
      }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by email or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9"
        />
      </div>

      <div className="rounded-md border bg-white dark:bg-slate-950">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>From</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : submissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No messages found.
                </TableCell>
              </TableRow>
            ) : (
              submissions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>
                      <div className="flex flex-col">
                          <span className="font-medium">{sub.first_name} {sub.last_name}</span>
                          <span className="text-xs text-muted-foreground">{sub.email}</span>
                      </div>
                  </TableCell>
                  <TableCell>
                      <span className="truncate max-w-[200px] block" title={sub.subject}>
                          {sub.subject}
                      </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={sub.status === "resolved" ? "default" : "secondary"}>
                      {sub.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(sub.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedSubmission(sub)}>
                          View
                      </Button>
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

      <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>{selectedSubmission?.subject}</DialogTitle>
                  <DialogDescription>
                      From: {selectedSubmission?.first_name} {selectedSubmission?.last_name} ({selectedSubmission?.email})
                  </DialogDescription>
              </DialogHeader>
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md text-sm whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                  {selectedSubmission?.message}
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                  {selectedSubmission?.status === "pending" ? (
                      <Button 
                        onClick={() => updateStatus(selectedSubmission.id, "resolved")}
                        disabled={updating}
                      >
                          {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Mark as Resolved
                      </Button>
                  ) : (
                      <Button 
                        variant="outline"
                        onClick={() => updateStatus(selectedSubmission!.id, "pending")}
                        disabled={updating}
                      >
                          {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Mark as Pending
                      </Button>
                  )}
                  <Button variant="ghost" onClick={() => setSelectedSubmission(null)}>
                      Close
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  )
}

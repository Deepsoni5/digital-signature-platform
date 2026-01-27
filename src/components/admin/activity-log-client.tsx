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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Globe, Monitor, MapPin } from "lucide-react"
import { format } from "date-fns"

interface ActivityLog {
  id: string
  event_type: string
  actor_name: string
  actor_email: string
  ip_address: string
  user_agent: string
  metadata: string
  created_at: string
  documents?: {
      file_name: string
  }
}

export function ActivityLogClient() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchLogs()
  }, [page])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      })
      const res = await fetch(`/api/admin/activity?${params}`)
      const data = await res.json()
      
      if (data.data) {
        setLogs(data.data)
        setTotalPages(data.metadata.totalPages)
      }
    } catch (error) {
      console.error("Failed to fetch logs", error)
    } finally {
      setLoading(false)
    }
  }

  const parseMetadata = (json: string) => {
      try {
          return JSON.parse(json);
      } catch (e) {
          return {};
      }
  }

  const formatEventType = (type: string) => {
      return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-white dark:bg-slate-950">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Document</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No activity found.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => {
                const meta = parseMetadata(log.metadata);
                return (
                    <TableRow key={log.id}>
                    <TableCell>
                        <Badge variant="outline" className="font-medium">
                            {formatEventType(log.event_type)}
                        </Badge>
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-col">
                            <span className="font-medium">{log.actor_name}</span>
                            <span className="text-xs text-muted-foreground">{log.actor_email}</span>
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                            {meta.location && (
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {meta.location}
                                </div>
                            )}
                            <div className="flex items-center gap-1" title={log.ip_address}>
                                <Globe className="h-3 w-3" />
                                {log.ip_address}
                            </div>
                        </div>
                    </TableCell>
                    <TableCell>
                        <span className="text-sm truncate max-w-[200px] block" title={log.documents?.file_name}>
                            {log.documents?.file_name || "N/A"}
                        </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                        {format(new Date(log.created_at), "MMM d, HH:mm")}
                    </TableCell>
                    </TableRow>
                )
              })
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

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
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Loader2 } from "lucide-react"
import { format } from "date-fns"

interface User {
  id: string
  email: string
  full_name: string
  plan_name: string
  is_premium: boolean
  created_at: string
  last_sign_in_at?: string
}

export function UserManagementClient() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1) // Reset to page 1 on search change
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    fetchUsers()
  }, [page, debouncedSearch])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search: debouncedSearch,
      })
      const res = await fetch(`/api/admin/users?${params}`)
      const data = await res.json()
      
      if (data.users) {
        setUsers(data.users)
        setTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error("Failed to fetch users", error)
    } finally {
      setLoading(false)
    }
  }

  const getPlanBadgeColor = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case "elite": return "bg-amber-500 hover:bg-amber-600"
      case "pro": return "bg-indigo-500 hover:bg-indigo-600"
      case "basic": return "bg-emerald-500 hover:bg-emerald-600"
      default: return "bg-slate-500 hover:bg-slate-600"
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
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading users...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name || "N/A"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge className={getPlanBadgeColor(user.plan_name)}>
                      {user.plan_name || "Free"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.created_at ? format(new Date(user.created_at), "MMM d, yyyy") : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={user.is_premium ? "default" : "secondary"}>
                      {user.is_premium ? "Premium" : "Standard"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button 
                variant="ghost" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
            </PaginationItem>
            <PaginationItem>
               <span className="text-sm text-muted-foreground mx-2">
                 Page {page} of {totalPages}
               </span>
            </PaginationItem>
            <PaginationItem>
              <Button 
                variant="ghost" 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}

import { useState } from "react"
import { useQuery, gql } from "@apollo/client"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SessionTable } from "./session-table"
// GraphQL query to fetch sessions
const GET_ALL_SESSIONS = gql`
  query GetAllSession {
    getAllSession {
      id
      ipAddress
      userAgent
      createdAt
      userId
    }
  }
`

interface Session {
  id: string
  userId: string
  ipAddress: string
  userAgent: string
  createdAt: string
}

export function SessionDashboard() {
  const { data, loading, error } = useQuery<{ getAllSession: Session[] }>(GET_ALL_SESSIONS)
  const [searchQuery, setSearchQuery] = useState("")
  // const [activityFilter, setActivityFilter] = useState("all")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  if (loading) return <p>Loading sessions...</p>
  if (error) return <p>Error loading sessions: {error.message}</p>

  const allSessions = data?.getAllSession || []

  // Apply filters
  const filteredSessions = allSessions.filter((session) => {
    // Search filter
    const matchesSearch =
      session?.userId?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      session?.id?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      session?.ipAddress?.toLowerCase()?.includes(searchQuery?.toLowerCase())

    // Date filter
    const matchesDate = !date || format(new Date(session.createdAt), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")

    return matchesSearch && matchesDate
  })

  // Pagination
  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage)
  const paginatedSessions = filteredSessions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row">
        <Input
          placeholder="Search by user ID, session ID or IP..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[180px] justify-start text-left font-normal">
              {date ? format(date, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
          </PopoverContent>
        </Popover>

        {(date || searchQuery) && (
          <Button
            variant="ghost"
            onClick={() => {
              setSearchQuery("")
              setDate(undefined)
            }}
          >
            Clear
          </Button>
        )}
      </div>

      <SessionTable sessions={paginatedSessions} />

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {paginatedSessions.length} of {filteredSessions.length} sessions
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="text-sm">
            Page {currentPage} of {totalPages || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

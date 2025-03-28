import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Session {
  id: string
  userId: string
  ipAddress: string
  userAgent: string
  createdAt: string
}

interface SessionTableProps {
  sessions: Session[]
}

export function SessionTable({ sessions }: SessionTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Session ID</TableHead>
            <TableHead>User ID</TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead>User Agent</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <TableRow key={session.id}>
                <TableCell className="font-mono text-xs">{session.id}</TableCell>
                <TableCell>{session.userId}</TableCell>
                <TableCell>{format(new Date(session.createdAt), "MMM dd, yyyy HH:mm:ss")}</TableCell>
                <TableCell>{session.ipAddress}</TableCell>
                <TableCell className="max-w-[200px] truncate">{session.userAgent}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No sessions found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

import { v4 as uuidv4 } from "uuid"

export interface Session {
  id: number
  sessionId: string
  userId: string
  timestamp: string
  activity: string
  ipAddress: string
  userAgent: string
}

const activities = ["login", "logout", "view", "purchase", "signup"]
const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36",
]

export function generateDummyData(count: number): Session[] {
  const sessions: Session[] = []

  // Generate some consistent session IDs and user IDs
  const sessionIds = Array(10)
    .fill(0)
    .map(() => uuidv4())
  const userIds = Array(20)
    .fill(0)
    .map((_, i) => `user${i + 1}`)

  for (let i = 0; i < count; i++) {
    // Generate a random date within the last 7 days
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 7))
    date.setHours(Math.floor(Math.random() * 24))
    date.setMinutes(Math.floor(Math.random() * 60))
    date.setSeconds(Math.floor(Math.random() * 60))

    // Generate a random IP address
    const ip = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`

    sessions.push({
      id: i + 1,
      sessionId: sessionIds[Math.floor(Math.random() * sessionIds.length)],
      userId: userIds[Math.floor(Math.random() * userIds.length)],
      timestamp: date.toISOString(),
      activity: activities[Math.floor(Math.random() * activities.length)],
      ipAddress: ip,
      userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
    })
  }

  // Sort by timestamp, newest first
  return sessions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}


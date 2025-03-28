// import { SessionDashboard } from "@/components/session-dashboard"

import { SessionDashboard } from "./components/session-dashboard";

export default function AnalyticsDashbaord() {
  return (
    <main className="w-full bg-blue-400 rounded-lg  mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Session Tracking Dashboard</h1>
      <SessionDashboard />
    </main>
  )
}


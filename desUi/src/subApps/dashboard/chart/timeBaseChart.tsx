"use client"

import { useState } from "react"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const orderData = {
  weekly: [
    { period: "Mon", morning: 45, afternoon: 60, evening: 75 },
    { period: "Tue", morning: 50, afternoon: 65, evening: 80 },
    { period: "Wed", morning: 55, afternoon: 70, evening: 85 },
    { period: "Thu", morning: 40, afternoon: 55, evening: 70 },
    { period: "Fri", morning: 60, afternoon: 75, evening: 90 },
    { period: "Sat", morning: 70, afternoon: 85, evening: 100 },
    { period: "Sun", morning: 65, afternoon: 80, evening: 95 },
  ],
  monthly: [
    { period: "Jan", morning: 1200, afternoon: 1500, evening: 1800 },
    { period: "Feb", morning: 1300, afternoon: 1600, evening: 1900 },
    { period: "Mar", morning: 1400, afternoon: 1700, evening: 2000 },
    { period: "Apr", morning: 1500, afternoon: 1800, evening: 2100 },
    { period: "May", morning: 1600, afternoon: 1900, evening: 2200 },
    { period: "Jun", morning: 1700, afternoon: 2000, evening: 2300 },
    { period: "Jul", morning: 1800, afternoon: 2100, evening: 2400 },
    { period: "Aug", morning: 1900, afternoon: 2200, evening: 2500 },
    { period: "Sep", morning: 2000, afternoon: 2300, evening: 2600 },
    { period: "Oct", morning: 2100, afternoon: 2400, evening: 2700 },
    { period: "Nov", morning: 2200, afternoon: 2500, evening: 2800 },
    { period: "Dec", morning: 2300, afternoon: 2600, evening: 2900 },
  ],
  yearly: [
    { period: "2020", morning: 20000, afternoon: 25000, evening: 30000 },
    { period: "2021", morning: 22000, afternoon: 27000, evening: 32000 },
    { period: "2022", morning: 24000, afternoon: 29000, evening: 34000 },
    { period: "2023", morning: 26000, afternoon: 31000, evening: 36000 },
    { period: "2024", morning: 28000, afternoon: 33000, evening: 38000 },
  ],
}

const chartConfig = {
  morning: {
    label: "Morning",
    color: "hsl(var(--chart-1))",
  },
  afternoon: {
    label: "Afternoon",
    color: "hsl(var(--chart-2))",
  },
  evening: {
    label: "Evening",
    color: "hsl(var(--chart-3))",
  },
}

export function TimeBaseChart() {
  const [currentView, setCurrentView] = useState<"weekly" | "monthly" | "yearly">("weekly")

  const handleViewChange = (value: string) => {
    setCurrentView(value as "weekly" | "monthly" | "yearly")
  }

  const getCurrentData = () => orderData[currentView]

  const getChartTitle = () => {
    switch (currentView) {
      case "weekly":
        return "Weekly Order Items"
      case "monthly":
        return "Monthly Order Items"
      case "yearly":
        return "Yearly Order Items"
    }
  }

  const getChartDescription = () => {
    switch (currentView) {
      case "weekly":
        return "Breakdown by time of day for each day of the week"
      case "monthly":
        return "Breakdown by time of day for each month"
      case "yearly":
        return "Annual breakdown by time of day"
    }
  }

  const getTrendText = () => {
    switch (currentView) {
      case "weekly":
        return "Evening orders trending up by 8.5% this week"
      case "monthly":
        return "Monthly growth rate: 6.7% across all time periods"
      case "yearly":
        return "Year-over-year growth: 14.3% on average across all time periods"
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{getChartTitle()}</CardTitle>
          <Select onValueChange={handleViewChange} defaultValue={currentView}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CardDescription>{getChartDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={500}>
          <BarChart data={getCurrentData()} barSize={20} barGap={0}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="morning" fill={chartConfig.morning.color} radius={4} />
            <Bar dataKey="afternoon" fill={chartConfig.afternoon.color} radius={4} />
            <Bar dataKey="evening" fill={chartConfig.evening.color} radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          {getTrendText()} <TrendingUp className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  )
}


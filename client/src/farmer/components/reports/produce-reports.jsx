import React, { useMemo, useRef, useState } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

// Recharts
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock dataset: daily prices for multiple produce across localities with an estimated cost for margin calc
// In production, replace this with real data from your API/DB
const MOCK_DATA = [
  // Tomatoes
  { date: "2025-08-01", produce: "Tomato", locality: "Village A", price: 22, cost: 12 },
  { date: "2025-08-01", produce: "Tomato", locality: "Village B", price: 24, cost: 12 },
  { date: "2025-08-02", produce: "Tomato", locality: "Village A", price: 21, cost: 12 },
  { date: "2025-08-02", produce: "Tomato", locality: "Village B", price: 23, cost: 12 },
  { date: "2025-08-03", produce: "Tomato", locality: "Village A", price: 25, cost: 13 },
  { date: "2025-08-03", produce: "Tomato", locality: "Village B", price: 26, cost: 13 },
  { date: "2025-08-04", produce: "Tomato", locality: "Village A", price: 24, cost: 13 },
  { date: "2025-08-04", produce: "Tomato", locality: "Village B", price: 27, cost: 13 },

  // Potatoes
  { date: "2025-08-01", produce: "Potato", locality: "Village A", price: 15, cost: 9 },
  { date: "2025-08-01", produce: "Potato", locality: "Village B", price: 17, cost: 9 },
  { date: "2025-08-02", produce: "Potato", locality: "Village A", price: 16, cost: 9 },
  { date: "2025-08-02", produce: "Potato", locality: "Village B", price: 18, cost: 9 },
  { date: "2025-08-03", produce: "Potato", locality: "Village A", price: 17, cost: 10 },
  { date: "2025-08-03", produce: "Potato", locality: "Village B", price: 19, cost: 10 },
  { date: "2025-08-04", produce: "Potato", locality: "Village A", price: 18, cost: 10 },
  { date: "2025-08-04", produce: "Potato", locality: "Village B", price: 20, cost: 10 },

  // Onions
  { date: "2025-08-01", produce: "Onion", locality: "Village A", price: 12, cost: 7 },
  { date: "2025-08-01", produce: "Onion", locality: "Village B", price: 13, cost: 7 },
  { date: "2025-08-02", produce: "Onion", locality: "Village A", price: 12.5, cost: 7 },
  { date: "2025-08-02", produce: "Onion", locality: "Village B", price: 13.2, cost: 7 },
  { date: "2025-08-03", produce: "Onion", locality: "Village A", price: 14, cost: 8 },
  { date: "2025-08-03", produce: "Onion", locality: "Village B", price: 14.5, cost: 8 },
  { date: "2025-08-04", produce: "Onion", locality: "Village A", price: 13.8, cost: 8 },
  { date: "2025-08-04", produce: "Onion", locality: "Village B", price: 14.6, cost: 8 },
]

const unique = (arr) => Array.from(new Set(arr))

function mean(nums) {
  if (!nums.length) return 0
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

export default function ProduceReports() {
  const [produce, setProduce] = useState("Tomato")
  const [localities, setLocalities] = useState("ALL")
  const reportRef = useRef(null)

  const produceOptions = useMemo(() => unique(MOCK_DATA.map((d) => d.produce)), [])

  const allLocalities = useMemo(
    () => unique(MOCK_DATA.filter((d) => d.produce === produce).map((d) => d.locality)).sort(),
    [produce]
  )

  // Trend chart data
  const trendData = useMemo(() => {
    const rows = MOCK_DATA.filter(
      (d) => d.produce === produce && (localities === "ALL" || localities.includes(d.locality))
    )
    const byDate = new Map()
    rows.forEach((r) => {
      if (!byDate.has(r.date)) byDate.set(r.date, [])
      byDate.get(r.date).push(r)
    })
    const points = Array.from(byDate.entries()).map(([date, arr]) => {
      const avgPrice = mean(arr.map((x) => x.price))
      const avgCost = mean(arr.map((x) => x.cost))
      return { date, price: Number(avgPrice.toFixed(2)), cost: Number(avgCost.toFixed(2)) }
    })
    return points.sort((a, b) => a.date.localeCompare(b.date))
  }, [produce, localities])

  // Locality comparison data
  const localityComparisonData = useMemo(() => {
    const rows = MOCK_DATA.filter((d) => d.produce === produce)
    const byLocality = new Map()
    rows.forEach((r) => {
      if (!byLocality.has(r.locality)) byLocality.set(r.locality, [])
      byLocality.get(r.locality).push(r)
    })
    return Array.from(byLocality.entries())
      .map(([loc, arr]) => {
        const avgPrice = mean(arr.map((x) => x.price))
        return { locality: loc, price: Number(avgPrice.toFixed(2)) }
      })
      .sort((a, b) => a.locality.localeCompare(b.locality))
  }, [produce])

  // Margin summary
  const marginSummary = useMemo(() => {
    const rows = MOCK_DATA.filter(
      (d) => d.produce === produce && (localities === "ALL" || localities.includes(d.locality))
    )
    const avgPrice = mean(rows.map((x) => x.price))
    const avgCost = mean(rows.map((x) => x.cost))
    const margin = avgPrice - avgCost
    const marginPct = avgPrice ? (margin / avgPrice) * 100 : 0
    return {
      avgPrice: Number(avgPrice.toFixed(2)),
      avgCost: Number(avgCost.toFixed(2)),
      margin: Number(margin.toFixed(2)),
      marginPct: Number(marginPct.toFixed(1)),
    }
  }, [produce, localities])

  const handleExport = () => {
    if (typeof window !== "undefined") {
      window.print()
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="gap-2">
          <CardTitle className="text-2xl">Select Produce</CardTitle>
          <CardDescription>Choose the produce you want to analyze</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Produce selector */}
          <div className="flex items-center gap-3">
            <label htmlFor="produce" className="text-sm text-muted-foreground">
              Produce
            </label>
            <Select value={produce} onValueChange={setProduce}>
              <SelectTrigger id="produce" className="w-48">
                <SelectValue placeholder="Select produce" />
              </SelectTrigger>
              <SelectContent>
                {produceOptions.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Localities filter */}
          <div className="flex items-center gap-3">
            <label className="text-sm text-muted-foreground">Localities</label>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant={localities === "ALL" ? "default" : "outline"}
                size="sm"
                onClick={() => setLocalities("ALL")}
                aria-pressed={localities === "ALL"}
              >
                All
              </Button>
              {allLocalities.map((l) => {
                const active = localities !== "ALL" && localities.includes(l)
                return (
                  <Button
                    key={l}
                    type="button"
                    variant={active ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setLocalities((prev) => {
                        if (prev === "ALL") return [l]
                        const set = new Set(prev)
                        if (set.has(l)) {
                          set.delete(l)
                        } else {
                          set.add(l)
                        }
                        const arr = Array.from(set)
                        return arr.length ? arr : "ALL"
                      })
                    }}
                    aria-pressed={active}
                  >
                    {l}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Export */}
          <div className="ml-auto">
            <Button onClick={handleExport} variant="secondary">
              Export Report (PDF)
            </Button>
          </div>
        </CardContent>
      </Card>

      <div ref={reportRef} className="space-y-6 print:block">
        {/* Price Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Price Trend</CardTitle>
            <CardDescription>
              Average daily price for {produce}
              {localities === "ALL" ? " (all localities)" : ` (${localities.join(", ")})`}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ChartContainer
              config={{
                price: { label: "Price", color: "hsl(var(--chart-1))" },
                cost: { label: "Cost", color: "hsl(var(--chart-2))" },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(d) => format(new Date(d), "MM-dd")} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="price" stroke="var(--color-price)" dot={false} name="Avg Price" />
                  <Line type="monotone" dataKey="cost" stroke="var(--color-cost)" dot={false} name="Avg Cost" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Locality Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Locality Comparison</CardTitle>
            <CardDescription>Average price by locality for {produce}</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ChartContainer
              config={{
                price: { label: "Price", color: "hsl(var(--chart-3))" },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={localityComparisonData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="locality" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="price" fill="var(--color-price)" name="Avg Price" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Margin Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Margin Summary</CardTitle>
            <CardDescription>Average price vs. cost and margin for {produce}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Metric label="Avg Price" value={`₹ ${marginSummary.avgPrice.toFixed(2)}/kg`} />
              <Metric label="Avg Cost" value={`₹ ${marginSummary.avgCost.toFixed(2)}/kg`} />
              <Metric label="Avg Margin" value={`₹ ${marginSummary.margin.toFixed(2)}/kg`} />
              <Metric label="Margin %" value={`${marginSummary.marginPct.toFixed(1)}%`} />
            </div>
            <Separator className="my-4" />
            <p className="text-xs text-muted-foreground">
              Notes: Prices are averaged by day across selected localities. Costs are illustrative; connect your real
              input costs for accurate margin analysis.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div className="rounded-md border bg-card p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-medium">{value}</div>
    </div>
  )
}
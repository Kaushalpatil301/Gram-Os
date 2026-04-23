import { useMemo, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { exportElementToPDF } from "../../lib/pdf"

// Recharts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// --------------------
// STATIC STOCK DATA
// --------------------
const STOCK_DATA = [
  { produce: "Wheat", quantity: 120 },
  { produce: "Tomato", quantity: 4 },
  { produce: "Potato", quantity: 50 },
  { produce: "Green Peas", quantity: 57 },
]

const MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
]

export default function ReportsSection() {
  const reportRef = useRef(null)

  const [selectedMonth, setSelectedMonth] = useState(
    MONTHS[new Date().getMonth()]
  )

  // Chart-ready data
  const chartData = useMemo(() => STOCK_DATA, [])

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Current Stock Report</h2>
          <p className="text-muted-foreground">
            View available stock quantity for each produce (month-wise).
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() =>
            exportElementToPDF(reportRef.current, "current-stock-report.pdf")
          }
        >
          Download Stock Report
        </Button>
      </div>

      {/* FILTERS */}
      <Card className="mb-4">
        <CardContent className="pt-6 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label className="text-sm">Month</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* CHARTS */}
      <div ref={reportRef}>
  <Card className="bg-background/60 backdrop-blur">
    <CardHeader>
      <CardTitle>Current Stock Overview (kg)</CardTitle>
    </CardHeader>

    <CardContent className="h-[420px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={STOCK_DATA} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="produce" />
          <YAxis />
          <Tooltip />
          <Bar
            dataKey="quantity"
            fill="#16a34a"
            radius={[6, 6, 0, 0]}
            name="Available Stock (kg)"
          />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
</div>

      {/* FOOTNOTE */}
      <p className="mt-3 text-xs text-muted-foreground">
        Showing available stock for <strong>{selectedMonth}</strong>.  
        Data reflects farmer-entered inventory records.
      </p>
    </div>
  )
}
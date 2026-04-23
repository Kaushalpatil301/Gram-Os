import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import PriceTrendChart from "../charts/price-trend-chart"
import LocalityComparisonChart from "../charts/locality-comparison-chart"
import { Button } from "../../../components/ui/button"

export default function MarketSection({ produce, marketData }) {
  const [selectedId, setSelectedId] = useState(produce[0]?.id || "")
  const selected = useMemo(
    () => marketData.find((m) => m.id === selectedId) || marketData[0],
    [marketData, selectedId]
  )

  const locality = selected?.locality || "Local"
  const localityCompare = useMemo(() => {
    const same = marketData.filter((m) => m.locality === locality)
    return same.length ? same : marketData.slice(0, Math.min(5, marketData.length))
  }, [marketData, locality])

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Local Market Insights</h2>
          <p className="text-muted-foreground">Real-time prices and locality comparisons.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select produce" />
            </SelectTrigger>
            <SelectContent>
              {produce.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setSelectedId(produce[0]?.id || "")}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="mt-4 grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1 bg-background/60 backdrop-blur">
          <CardHeader>
            <CardTitle>Current Consumer Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{selected?.consumerPrice.toFixed(2)}</div>
            <div className="mt-2 text-sm text-muted-foreground">
              For: <span className="font-medium">{selected?.name}</span> in{" "}
              <span className="font-medium">{locality}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-background/60 backdrop-blur">
          <CardHeader>
            <CardTitle>Price Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <PriceTrendChart seed={selected?.name || "seed"} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-4">
        <Card className="bg-background/60 backdrop-blur">
          <CardHeader>
            <CardTitle>Locality Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <LocalityComparisonChart data={localityCompare} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
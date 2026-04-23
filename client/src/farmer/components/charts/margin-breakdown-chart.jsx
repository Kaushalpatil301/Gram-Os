import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

export default function MarginBreakdownChart() {
  const data = [
    { stage: "Farmer", base: 20, margin: 0 },
    { stage: "Distributor", base: 20, margin: 5 },
    { stage: "Retailer", base: 25, margin: 7 },
    { stage: "Consumer", base: 32, margin: 0 },
  ]
  return (
    <div className="w-full h-72">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
          <XAxis dataKey="stage" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip />
          <Bar dataKey="base" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="margin" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
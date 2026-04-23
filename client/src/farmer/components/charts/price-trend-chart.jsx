import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

export default function PriceTrendChart({ seed }) {
  const data = generate(seed)
  return (
    <div className="w-full h-64">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
          <XAxis dataKey="date" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip />
          <Line type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function generate(seed) {
  const out = []
  let base = 20 + ((seed?.length ?? 0) % 10)
  for (let i = 11; i >= 0; i--) {
    const noise = (Math.sin((i + (seed?.length ?? 0)) / 2) + Math.random() * 0.5) * 2
    base = Math.max(8, base + (Math.random() - 0.4) * 2 + noise * 0.1)
    out.push({ date: `M-${i}`, price: Math.round(base * 100) / 100 })
  }
  return out
}
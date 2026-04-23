import ProduceReports from "@/components/reports/produce-reports"

export default function ReportsPage() {
  return (
    <main className="container mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-balance">
          Price Journey Reports
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Select a produce to see its price trend over time and compare average
          prices across localities.
        </p>
      </header>
      <ProduceReports />
    </main>
  )
}
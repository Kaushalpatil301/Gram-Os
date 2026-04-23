import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"

export default function AccountSection({ reports }) {
  return (
    <div>
      <h2 className="text-2xl font-bold">Account</h2>
      <p className="text-muted-foreground">View your activity and recent reports.</p>

      <div className="mt-4 grid md:grid-cols-2 gap-4">
        <Card className="bg-background/60 backdrop-blur">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <div>
              <span className="font-medium">Name:</span> Demo Farmer
            </div>
            <div>
              <span className="font-medium">Locality:</span> Nashik, MH
            </div>
            <div>
              <span className="font-medium">Verification:</span>{" "}
              <Badge variant="outline" className="border-emerald-500 text-emerald-700">
                On-chain
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/60 backdrop-blur">
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent reports.</p>
            ) : (
              <ul className="grid gap-2">
                {reports.slice(0, 5).map((r) => (
                  <li key={r.id} className="text-sm">
                    <span className="font-medium">{r.party}</span> — {prettyReason(r.reason)}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function prettyReason(v) {
  switch (v) {
    case "unfair-pricing":
      return "Unfair Pricing"
    case "delayed-payments":
      return "Delayed Payments"
    case "fraudulent-activities":
      return "Fraudulent Activities"
    default:
      return v
  }
}

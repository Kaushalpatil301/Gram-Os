import React from "react";
import { Briefcase, BarChart2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { fmtMoney, MONTHLY_EARNINGS } from "../../lib/data";

function EarningsChart({ data }) {
  const max = Math.max(...data.map((d) => d.amount));
  return (
    <div className="flex items-end gap-2 h-24 mt-5">
      {data.map((d) => (
        <div key={d.month} className="flex flex-col items-center flex-1 gap-1">
          <div
            className="w-full bg-emerald-500 rounded-t-sm"
            style={{ height: `${Math.round((d.amount / max) * 80)}px` }}
          />
          <span className="text-xs text-gray-500">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

export default function EarningsSection({ earnings }) {
  return (
    <>
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900">Earnings</h3>
        <p className="text-sm text-gray-600">
          Your income and financial standing this season
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm md:col-span-2">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {fmtMoney(earnings.weekly)}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">This Week</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {fmtMoney(earnings.seasonTotal)}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Season Total
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {fmtMoney(earnings.avgDaily)}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">Avg Daily</div>
                <div className="text-xs text-gray-400">
                  District: {fmtMoney(earnings.districtAvg)}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {earnings.creditScore}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Credit Score
                </div>
                <div
                  className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                    earnings.loanEligible
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  <Briefcase className="w-3 h-3" />
                  {earnings.loanEligible ? "Loan Eligible" : "Not Eligible"}
                </div>
              </div>
            </div>
            <EarningsChart data={MONTHLY_EARNINGS} />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-4 h-4 text-emerald-600" />
              <h4 className="font-semibold text-gray-900">Season Stats</h4>
            </div>
            {[
              {
                label: "Gigs completed",
                val: 126,
                max: 150,
                color: "bg-emerald-500",
              },
              {
                label: "On-time rate",
                val: 94,
                max: 100,
                color: "bg-green-400",
                suffix: "%",
              },
              {
                label: "Quality rating",
                val: 4.6,
                max: 5,
                color: "bg-amber-400",
                suffix: "/5",
              },
            ].map(({ label, val, max, color, suffix }) => (
              <div key={label} className="mb-4 last:mb-0">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{label}</span>
                  <span className="font-medium text-gray-900">
                    {val}
                    {suffix ?? ""}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color} rounded-full`}
                    style={{
                      width: `${Math.round((val / max) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Award, Target, ArrowUp, ArrowDown, Info } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { calculateCreditScore, generateCreditHistory, getMockFarmerData } from "../../lib/creditEngine";

export default function CreditSection() {
  const farmer = getMockFarmerData();
  const credit = useMemo(() => calculateCreditScore(farmer), []);
  const history = useMemo(() => generateCreditHistory(), []);

  const scoreAngle = (credit.score / 900) * 270 - 135; // map 0-900 to -135 to 135 degrees
  const circumference = 2 * Math.PI * 80;
  const dashOffset = circumference - (credit.score / 900) * circumference * 0.75;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <div className="p-2 bg-amber-100 rounded-xl"><Award className="w-5 h-5 text-amber-700" /></div>
          Rural Credit Score
        </h2>
        <p className="text-gray-500 mt-1">Your financial identity built from platform activity — every transaction strengthens it.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Score Gauge */}
        <Card className="border-0 shadow-lg lg:col-span-1">
          <CardContent className="p-8 text-center">
            <div className="relative w-48 h-48 mx-auto">
              <svg className="w-full h-full transform -rotate-[135deg]" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" strokeWidth="12" strokeDasharray={circumference * 0.75} strokeDashoffset={0} strokeLinecap="round" />
                <circle cx="100" cy="100" r="80" fill="none" stroke={credit.grade.color} strokeWidth="12" strokeDasharray={circumference * 0.75} strokeDashoffset={dashOffset} strokeLinecap="round" className="transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-5xl font-black" style={{ color: credit.grade.color }}>{credit.score}</div>
                <div className="text-sm font-bold text-gray-500">/ 900</div>
              </div>
            </div>
            <Badge className="mt-4 text-lg px-4 py-1" style={{ backgroundColor: credit.grade.color + "20", color: credit.grade.color }}>{credit.grade.label}</Badge>
            {credit.eligible ? (
              <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3"><p className="text-emerald-700 text-sm font-medium">✅ Eligible for agricultural loans</p></div>
            ) : (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3"><p className="text-amber-700 text-sm font-medium">🔄 Build activity for loan eligibility</p></div>
            )}
            <div className="mt-4 bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 font-medium uppercase">Next Milestone</p>
              <p className="text-sm font-bold text-gray-800 mt-1"><Target className="w-3 h-3 inline mr-1" />{credit.nextMilestone.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">Score needed: {credit.nextMilestone.threshold}</p>
            </div>
          </CardContent>
        </Card>

        {/* Factors */}
        <Card className="border-0 shadow-md lg:col-span-2">
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Info className="w-4 h-4 text-blue-500" /> Score Breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {credit.factors.map((factor, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: factor.status === "positive" ? "#d1fae5" : factor.status === "neutral" ? "#fef3c7" : "#fee2e2" }}>
                    {factor.status === "positive" ? <ArrowUp className="w-4 h-4 text-emerald-600" /> : factor.status === "neutral" ? <TrendingUp className="w-4 h-4 text-amber-600" /> : <ArrowDown className="w-4 h-4 text-red-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-800">{factor.name}</span>
                      <span className="text-sm font-bold" style={{ color: factor.status === "positive" ? "#059669" : factor.status === "neutral" ? "#d97706" : "#dc2626" }}>{factor.score}/100</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className="h-2.5 rounded-full transition-all duration-700" style={{ width: `${factor.score}%`, backgroundColor: factor.status === "positive" ? "#10B981" : factor.status === "neutral" ? "#F59E0B" : "#EF4444" }} />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5 uppercase">Weight: {factor.weight}% • Contributes {factor.contribution} points</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History Chart */}
      <Card className="border-0 shadow-md">
        <CardHeader><CardTitle className="text-lg">📈 Score History (12 Months)</CardTitle></CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs><linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10B981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10B981" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 900]} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`${v}`, "Credit Score"]} />
              <Area type="monotone" dataKey="score" stroke="#10B981" strokeWidth={3} fill="url(#scoreGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="border-0 shadow-md bg-gradient-to-r from-amber-50 to-yellow-50">
        <CardContent className="p-5">
          <h3 className="font-bold text-gray-900 mb-3">💡 Tips to Improve Your Score</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {["Complete more transactions on the platform", "Maintain consistent crop quality ratings above 4.0", "Diversify crops across seasons (currently 4 types)", "Ensure on-time deliveries to buyers", "Stay active every month — log produce and sales", "Link and verify your bank/UPI for payment tracking"].map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-700"><span className="text-emerald-500 mt-0.5">✓</span>{tip}</div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

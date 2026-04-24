import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Award, Target, ArrowUp, ArrowDown, Info } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { generateCreditHistory } from "../../lib/creditEngine";
import { useProfile } from "../../../contexts/useProfile";
import { Loader2 } from "lucide-react";
import { getCachedTrustLoanData, prefetchTrustLoanData } from "../../../lib/trustLoanCache";
import { useTranslation } from "../../../consumer/i18n/config.jsx";
import translationService from "../../../consumer/i18n/translationService";

export default function CreditSection() {
  const { t, currentLanguage } = useTranslation();
  const { user, profile } = useProfile();
  const [credit, setCredit] = useState(null);
  const [translatedCredit, setTranslatedCredit] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const history = useMemo(() => generateCreditHistory(), []);

  useEffect(() => {
    let cancelled = false;

    async function getScore() {
      setLoading(true);
      try {
        const cached = getCachedTrustLoanData(user);
        if (cached?.credit) {
          if (!cancelled) setCredit(cached.credit);
          return;
        }

        const prefetched = await prefetchTrustLoanData({ user, profile });
        if (!cancelled) setCredit(prefetched?.credit || null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    getScore();

    return () => {
      cancelled = true;
    };
  }, [user, profile]);

  useEffect(() => {
    let cancelled = false;

    const translateDynamicCredit = async () => {
      if (!credit) {
        setTranslatedCredit(null);
        return;
      }
      if (!currentLanguage || currentLanguage === "en") {
        setTranslatedCredit(credit);
        return;
      }

      const payload = {};
      if (credit?.grade?.label) payload.gradeLabel = credit.grade.label;
      if (credit?.nextMilestone?.label) {
        payload.nextMilestoneLabel = credit.nextMilestone.label;
      }
      (credit?.factors || []).forEach((factor, i) => {
        if (factor?.name) payload[`factorName_${i}`] = factor.name;
      });
      (credit?.tips || []).forEach((tip, i) => {
        if (tip) payload[`tip_${i}`] = tip;
      });

      const translated = await translationService.batchTranslate(
        payload,
        currentLanguage,
        "google",
      );
      if (cancelled) return;

      setTranslatedCredit({
        ...credit,
        grade: {
          ...credit.grade,
          label: translated.gradeLabel || credit?.grade?.label,
        },
        nextMilestone: {
          ...credit.nextMilestone,
          label:
            translated.nextMilestoneLabel || credit?.nextMilestone?.label,
        },
        factors: (credit.factors || []).map((factor, i) => ({
          ...factor,
          name: translated[`factorName_${i}`] || factor.name,
        })),
        tips: (credit.tips || []).map(
          (tip, i) => translated[`tip_${i}`] || tip,
        ),
      });
    };

    translateDynamicCredit();
    return () => {
      cancelled = true;
    };
  }, [credit, currentLanguage]);

  const renderedCredit = translatedCredit || credit;

  if (loading || !renderedCredit) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-indigo-600">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="font-semibold animate-pulse">{t("credit.loading")}</p>
      </div>
    );
  }

  const scoreAngle = (renderedCredit.score / 900) * 270 - 135; // map 0-900 to -135 to 135 degrees
  const circumference = 2 * Math.PI * 80;
  const dashOffset =
    circumference - (renderedCredit.score / 900) * circumference * 0.75;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <div className="p-2 bg-amber-100 rounded-xl"><Award className="w-5 h-5 text-amber-700" /></div>
          {t("farmer.nav.credit")}
        </h2>
        <p className="text-gray-500 mt-1">{t("retailer.section.credit.subtitle")}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Score Gauge */}
        <Card className="border-0 shadow-lg lg:col-span-1">
          <CardContent className="p-8 text-center">
            <div className="relative w-48 h-48 mx-auto">
              <svg className="w-full h-full transform -rotate-[135deg]" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" strokeWidth="12" strokeDasharray={circumference * 0.75} strokeDashoffset={0} strokeLinecap="round" />
                <circle cx="100" cy="100" r="80" fill="none" stroke={renderedCredit.grade.color} strokeWidth="12" strokeDasharray={circumference * 0.75} strokeDashoffset={dashOffset} strokeLinecap="round" className="transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-5xl font-black" style={{ color: renderedCredit.grade.color }}>{renderedCredit.score}</div>
                <div className="text-sm font-bold text-gray-500">/ 900</div>
              </div>
            </div>
            <Badge className="mt-4 text-lg px-4 py-1" style={{ backgroundColor: renderedCredit.grade.color + "20", color: renderedCredit.grade.color }}>{renderedCredit.grade.label}</Badge>
            {renderedCredit.eligible ? (
              <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3"><p className="text-emerald-700 text-sm font-medium">✅ {t("credit.eligible")}</p></div>
            ) : (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3"><p className="text-amber-700 text-sm font-medium">🔄 {t("credit.buildActivity")}</p></div>
            )}
            <div className="mt-4 bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 font-medium uppercase">{t("credit.nextMilestone")}</p>
              <p className="text-sm font-bold text-gray-800 mt-1"><Target className="w-3 h-3 inline mr-1" />{renderedCredit.nextMilestone.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{t("credit.scoreNeeded", { score: renderedCredit.nextMilestone.threshold })}</p>
            </div>
          </CardContent>
        </Card>

        {/* Factors */}
        <Card className="border-0 shadow-md lg:col-span-2">
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Info className="w-4 h-4 text-blue-500" /> {t("credit.scoreBreakdown")}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {renderedCredit.factors.map((factor, i) => (
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
                    <p className="text-[10px] text-gray-400 mt-0.5 uppercase">{t("credit.weightContribution", { weight: factor.weight, points: factor.contribution })}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History Chart */}
      <Card className="border-0 shadow-md">
        <CardHeader><CardTitle className="text-lg">📈 {t("credit.scoreHistory")}</CardTitle></CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs><linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10B981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10B981" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 900]} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`${v}`, t("credit.tooltip.score")]} />
              <Area type="monotone" dataKey="score" stroke="#10B981" strokeWidth={3} fill="url(#scoreGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="border-0 shadow-md bg-gradient-to-r from-amber-50 to-yellow-50">
        <CardContent className="p-5">
          <h3 className="font-bold text-gray-900 mb-3">💡 {t("credit.tipsTitle")}</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {(renderedCredit.tips || ["Complete more verified transactions on the platform", "Maintain high quality in all deliverables"]).map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-700"><span className="text-emerald-500 mt-0.5">✓</span>{tip}</div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

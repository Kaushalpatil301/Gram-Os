import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle, FileText, ChevronDown, ChevronUp, Landmark,
  ExternalLink, Brain, TrendingUp, Shield, Zap, AlertCircle,
  IndianRupee, Clock, Star, Info, ArrowRight
} from "lucide-react";
import { matchSchemes, getEstimatedBenefits } from "../../lib/schemesMatcher";
import { useProfile } from "../../../contexts/useProfile";
import { useTranslation } from "../../../consumer/i18n/config.jsx";
import translationService from "../../../consumer/i18n/translationService";

// ── Why Matched — explainability pill list ────────────────────────────────────
function MatchReasons({ reasons }) {
  return (
    <div className="flex flex-wrap gap-2">
      {reasons.map((r, i) => (
        <span key={i} className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1.5 rounded-full border border-indigo-100">
          <CheckCircle className="w-3 h-3 shrink-0" /> {r}
        </span>
      ))}
    </div>
  );
}

// ── Impact Preview — what changes after applying ──────────────────────────────
function ImpactPanel({ impact }) {
  const { t } = useTranslation();
  if (!impact) return null;
  return (
    <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-emerald-600" />
        <span className="text-sm font-bold text-emerald-800">{t("retailer.schemes.impactAfterApplying")}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {impact.map((item, i) => (
          <div key={i} className="bg-white rounded-xl p-3">
            <div className="text-lg font-black text-emerald-700">{item.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{item.label}</div>
            {item.sub && <div className="text-[10px] text-gray-400 mt-1">{item.sub}</div>}
          </div>
        ))}
      </div>
      {impact.narrative && (
        <p className="text-xs text-emerald-700 bg-emerald-100/60 rounded-xl px-3 py-2 leading-relaxed">
          {impact.narrative}
        </p>
      )}
    </div>
  );
}

// ── Urgency Banner ────────────────────────────────────────────────────────────
function UrgencyBanner({ deadline, urgency }) {
  const { t } = useTranslation();
  if (!deadline && !urgency) return null;
  const isHigh = urgency === "high";
  return (
    <div className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium ${isHigh ? "bg-red-50 text-red-700 border border-red-100" : "bg-amber-50 text-amber-700 border border-amber-100"}`}>
      <Clock className={`w-3.5 h-3.5 shrink-0 ${isHigh ? "text-red-500" : "text-amber-500"}`} />
      {deadline
        ? t("retailer.schemes.applicationDeadline", { deadline })
        : t("retailer.schemes.applySoon")}
    </div>
  );
}

// ── Single Scheme Card ────────────────────────────────────────────────────────
function SchemeCard({ scheme, isOpen, onToggle }) {
  const { t } = useTranslation();
  const tagColors = {
    credit: "bg-blue-100 text-blue-700",
    insurance: "bg-purple-100 text-purple-700",
    subsidy: "bg-amber-100 text-amber-700",
    income: "bg-emerald-100 text-emerald-700",
  };

  return (
    <Card className={`border-0 shadow-md overflow-hidden transition-all hover:shadow-lg ${!scheme.isEligible ? "opacity-55" : ""}`}>

      {/* Card Header — always visible */}
      <div
        className={`p-5 cursor-pointer transition-colors ${isOpen ? "bg-gray-50/80" : "hover:bg-gray-50/50"}`}
        onClick={onToggle}
      >
        <div className="flex items-start gap-4">
          {/* Icon + rank */}
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl">
              {scheme.icon}
            </div>
            {scheme.priority === 1 && (
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
                <Star className="w-3 h-3 text-white fill-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-base text-gray-900">{scheme.name}</h4>
                  {scheme.isEligible
                    ? <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">{t("retailer.schemes.eligible")}</Badge>
                    : <Badge variant="outline" className="text-gray-400 border-gray-200 text-xs">{t("retailer.schemes.notEligible")}</Badge>
                  }
                  {scheme.tag && (
                    <Badge className={`text-xs border-0 ${tagColors[scheme.tag] || "bg-gray-100 text-gray-600"}`}>
                      {scheme.tag}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{scheme.ministry}</p>
                <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{scheme.description}</p>
              </div>

              {/* Benefit amount + toggle */}
              <div className="flex items-center gap-3 shrink-0 ml-2">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-bold text-indigo-700 whitespace-nowrap">{scheme.benefit}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wide">{t("retailer.schemes.benefit")}</div>
                </div>
                {isOpen
                  ? <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
                  : <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                }
              </div>
            </div>

            {/* Why matched — visible on collapsed card too */}
            {scheme.isEligible && scheme.matchReasons && (
              <div className="mt-3">
                <MatchReasons reasons={scheme.matchReasons.slice(0, 3)} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Section */}
      {isOpen && (
        <div className="border-t border-gray-100 px-5 pb-6 pt-5 space-y-5 bg-white">

          {/* Urgency */}
          <UrgencyBanner deadline={scheme.deadline} urgency={scheme.urgency} />

          {/* Benefit highlight */}
          <div className="flex items-start gap-4 bg-indigo-50 rounded-2xl p-4">
            <div className="p-2 bg-indigo-100 rounded-xl shrink-0">
              <IndianRupee className="w-5 h-5 text-indigo-700" />
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-500 uppercase tracking-wide">{t("retailer.schemes.whatYouReceive")}</p>
              <p className="text-xl font-black text-indigo-800 mt-0.5">{scheme.benefit}</p>
              {scheme.benefitDetail && (
                <p className="text-sm text-indigo-600 mt-1">{scheme.benefitDetail}</p>
              )}
            </div>
          </div>

          {/* AI Explainability — why matched */}
          {scheme.isEligible && scheme.matchReasons && (
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <Brain className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">{t("retailer.schemes.whyYouQualify")}</span>
              </div>
              <div className="space-y-2">
                {scheme.matchReasons.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 bg-emerald-50 rounded-xl px-3 py-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-sm text-gray-700">{r}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Why NOT eligible */}
          {!scheme.isEligible && scheme.ineligibilityReasons && (
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">{t("retailer.schemes.whyYouDontQualifyYet")}</span>
              </div>
              <div className="space-y-2">
                {scheme.ineligibilityReasons.map((r, i) => (
                  <div key={i} className="flex items-start gap-3 bg-red-50 rounded-xl px-3 py-2.5">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600">{r}</span>
                  </div>
                ))}
              </div>
              {scheme.howToQualify && (
                <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800">{scheme.howToQualify}</p>
                </div>
              )}
            </div>
          )}

          {/* Impact after applying */}
          {scheme.isEligible && scheme.impact && (
            <ImpactPanel impact={scheme.impact} />
          )}

          {/* Documents */}
          <div>
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-gray-500" /> {t("retailer.schemes.documentsRequired")}
            </p>
            <div className="flex flex-wrap gap-2">
              {scheme.docs.map((doc, i) => (
                <Badge key={i} variant="outline" className="text-xs py-1.5 px-3 border-gray-200 text-gray-600">
                  {doc}
                </Badge>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div>
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" /> {t("retailer.schemes.howToApply")}
            </p>
            <div className="space-y-2">
              {scheme.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          {scheme.isEligible && (
            <div className="flex gap-2 pt-1">
              <Button className="bg-indigo-600 hover:bg-indigo-700 cursor-pointer gap-2">
                <ExternalLink className="w-3.5 h-3.5" /> {t("retailer.schemes.applyNow")}
              </Button>
              <Button variant="outline" className="cursor-pointer gap-2 text-sm">
                <Shield className="w-3.5 h-3.5" /> {t("retailer.schemes.saveForLater")}
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// ── Main Section ──────────────────────────────────────────────────────────────
export default function SchemesSection() {
  const { t, currentLanguage } = useTranslation();
  const { user, profile } = useProfile();
  const role = user?.role || "farmer";
  
  const schemes = useMemo(() => matchSchemes(role, profile || {}), [role, profile]);
  const [translatedSchemes, setTranslatedSchemes] = useState(schemes);
  const benefits = useMemo(() => getEstimatedBenefits(role, profile || {}), [role, profile]);
  
  const [expandedScheme, setExpandedScheme] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const translateSchemes = async () => {
      if (!schemes?.length) {
        setTranslatedSchemes([]);
        return;
      }
      if (!currentLanguage || currentLanguage === "en") {
        setTranslatedSchemes(schemes);
        return;
      }

      const payload = {};
      schemes.forEach((s, i) => {
        if (s.name) payload[`name_${i}`] = s.name;
        if (s.ministry) payload[`ministry_${i}`] = s.ministry;
        if (s.benefit) payload[`benefit_${i}`] = s.benefit;
        if (s.description) payload[`description_${i}`] = s.description;
        if (s.benefitDetail) payload[`benefitDetail_${i}`] = s.benefitDetail;
        if (s.howToQualify) payload[`howToQualify_${i}`] = s.howToQualify;
        if (s.deadline) payload[`deadline_${i}`] = s.deadline;
        if (s.matchReasons?.length) {
          s.matchReasons.forEach((value, j) => {
            payload[`matchReason_${i}_${j}`] = value;
          });
        }
        if (s.ineligibilityReasons?.length) {
          s.ineligibilityReasons.forEach((value, j) => {
            payload[`ineligibilityReason_${i}_${j}`] = value;
          });
        }
        if (s.docs?.length) {
          s.docs.forEach((value, j) => {
            payload[`doc_${i}_${j}`] = value;
          });
        }
        if (s.steps?.length) {
          s.steps.forEach((value, j) => {
            payload[`step_${i}_${j}`] = value;
          });
        }
        if (s.impact?.length) {
          s.impact.forEach((impact, j) => {
            if (impact?.label) payload[`impactLabel_${i}_${j}`] = impact.label;
            if (impact?.sub) payload[`impactSub_${i}_${j}`] = impact.sub;
          });
        }
        if (s.impact?.narrative) {
          payload[`impactNarrative_${i}`] = s.impact.narrative;
        }
      });

      const translated = await translationService.batchTranslate(
        payload,
        currentLanguage,
        "google",
      );
      if (cancelled) return;

      setTranslatedSchemes(
        schemes.map((s, i) => {
          const translatedImpact = (s.impact || []).map((impact, j) => ({
            ...impact,
            label: translated[`impactLabel_${i}_${j}`] || impact.label,
            sub: translated[`impactSub_${i}_${j}`] || impact.sub,
          }));
          if (s.impact?.narrative) {
            translatedImpact.narrative =
              translated[`impactNarrative_${i}`] || s.impact.narrative;
          }

          return {
            ...s,
            name: translated[`name_${i}`] || s.name,
            ministry: translated[`ministry_${i}`] || s.ministry,
            benefit: translated[`benefit_${i}`] || s.benefit,
            description: translated[`description_${i}`] || s.description,
            benefitDetail: translated[`benefitDetail_${i}`] || s.benefitDetail,
            howToQualify: translated[`howToQualify_${i}`] || s.howToQualify,
            deadline: translated[`deadline_${i}`] || s.deadline,
            matchReasons: (s.matchReasons || []).map(
              (value, j) => translated[`matchReason_${i}_${j}`] || value,
            ),
            ineligibilityReasons: (s.ineligibilityReasons || []).map(
              (value, j) =>
                translated[`ineligibilityReason_${i}_${j}`] || value,
            ),
            docs: (s.docs || []).map(
              (value, j) => translated[`doc_${i}_${j}`] || value,
            ),
            steps: (s.steps || []).map(
              (value, j) => translated[`step_${i}_${j}`] || value,
            ),
            impact: translatedImpact,
          };
        }),
      );
    };

    translateSchemes();
    return () => {
      cancelled = true;
    };
  }, [schemes, currentLanguage]);

  const eligible   = translatedSchemes.filter(s => s.isEligible);
  const displayed  = translatedSchemes;

  // Top 3 quick-win schemes for the action strip
  const quickWins = eligible.slice(0, 3);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <div className="p-2 bg-indigo-100 rounded-xl">
            <Landmark className="w-5 h-5 text-indigo-700" />
          </div>
          {t("retailer.nav.schemes")}
        </h2>
        <p className="text-gray-500 mt-1 text-sm">
          {t("retailer.section.schemes.subtitle")}
        </p>
      </div>

      {/* Hero benefit banner */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-indigo-200 text-sm font-medium">{t("retailer.schemes.aiMatchedForYou")}</p>
            <p className="text-5xl font-black mt-1">{benefits.count}</p>
            <p className="text-indigo-200 text-sm">{t("retailer.schemes.qualifyNow")}</p>
          </div>
          <div className="hidden md:block w-px h-16 bg-white/20" />
          <div className="text-left md:text-right">
            <p className="text-indigo-200 text-sm font-medium">{t("retailer.schemes.unclaimedValue")}</p>
            <p className="text-4xl font-black mt-1">₹{(benefits.totalEstimate / 100000).toFixed(1)}L+</p>
            <p className="text-indigo-200 text-xs mt-1">{t("retailer.schemes.creditInsuranceTransfers")}</p>
          </div>
          <div className="hidden md:block w-px h-16 bg-white/20" />
          <div>
            <p className="text-indigo-200 text-sm font-medium">{t("retailer.schemes.avgTimeToApply")}</p>
            <p className="text-4xl font-black mt-1">~20</p>
            <p className="text-indigo-200 text-xs mt-1">{t("retailer.schemes.minutesPerSchemeOnline")}</p>
          </div>
        </div>
      </div>

      {/* Quick action strip — top priority schemes */}
      {quickWins.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-bold text-gray-700">{t("retailer.schemes.applyTheseFirst")}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {quickWins.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setExpandedScheme(expandedScheme === s.id ? null : s.id)}
                className="text-left bg-white border border-indigo-100 rounded-2xl p-4 hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{s.icon}</span>
                  <Badge className="bg-indigo-50 text-indigo-700 border-0 text-[10px]">
                    {t("retailer.schemes.priorityRank", { rank: i + 1 })}
                  </Badge>
                </div>
                <p className="text-sm font-bold text-gray-800 leading-tight">{s.name}</p>
                <p className="text-xs font-bold text-indigo-700 mt-1">{s.benefit}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-indigo-500 group-hover:text-indigo-700 transition-colors">
                  {t("retailer.schemes.viewDetails")} <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}


      {/* Context — what data was used for matching */}
      <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-purple-600" />
          <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">{t("retailer.schemes.aiMatchedUsingProfile")}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {role === "farmer" && [
            { label: t("retailer.schemes.profile.land"), value: profile?.landSizeAcres ? `${profile.landSizeAcres} ${t("retailer.schemes.acres")}` : t("retailer.schemes.notProvided") },
            { label: t("retailer.schemes.profile.primaryCrop"), value: profile?.primaryCrops?.[0] || t("retailer.schemes.notProvided") },
            { label: t("retailer.schemes.profile.state"), value: profile?.state || t("retailer.schemes.notProvided") },
            { label: t("retailer.schemes.profile.soil"), value: profile?.soilType || t("retailer.schemes.notProvided") },
          ].map((f, i) => (
            <div key={i} className="bg-white rounded-xl px-3 py-2 text-center">
              <div className="text-xs font-bold text-gray-800 truncate">{f.value}</div>
              <div className="text-[9px] text-gray-400 uppercase font-semibold mt-0.5">{f.label}</div>
            </div>
          ))}
          {role === "retailer" && [
            { label: t("retailer.schemes.profile.businessType"), value: profile?.businessType || t("retailer.schemes.retail") },
            { label: t("retailer.schemes.profile.yearsInBiz"), value: profile?.yearsInBusiness || t("retailer.schemes.new") },
            { label: t("retailer.schemes.profile.gst"), value: profile?.gstNumber ? t("retailer.schemes.registered") : t("retailer.schemes.unregistered") },
            { label: t("retailer.schemes.profile.state"), value: profile?.location || t("retailer.schemes.notProvided") },
          ].map((f, i) => (
            <div key={i} className="bg-white rounded-xl px-3 py-2 text-center">
              <div className="text-xs font-bold text-gray-800 truncate">{f.value}</div>
              <div className="text-[9px] text-gray-400 uppercase font-semibold mt-0.5">{f.label}</div>
            </div>
          ))}
          {role === "villager" && [
            { label: t("retailer.schemes.profile.skills"), value: profile?.skills?.[0] || t("retailer.schemes.general") },
            { label: t("retailer.schemes.profile.experience"), value: profile?.experience || t("retailer.schemes.new") },
            { label: t("retailer.schemes.profile.creditScore"), value: profile?.creditScore || t("retailer.schemes.na") },
            { label: t("retailer.schemes.profile.location"), value: profile?.location || t("retailer.schemes.notProvided") },
          ].map((f, i) => (
            <div key={i} className="bg-white rounded-xl px-3 py-2 text-center">
              <div className="text-xs font-bold text-gray-800 truncate">{f.value}</div>
              <div className="text-[9px] text-gray-400 uppercase font-semibold mt-0.5">{f.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scheme Cards */}
      <div className="space-y-4">
        {displayed.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Landmark className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">{t("retailer.schemes.noneInCategory")}</p>
          </div>
        )}
        {displayed.map(scheme => (
          <SchemeCard
            key={scheme.id}
            scheme={scheme}
            isOpen={expandedScheme === scheme.id}
            onToggle={() => setExpandedScheme(expandedScheme === scheme.id ? null : scheme.id)}
          />
        ))}
      </div>
    </div>
  );
}
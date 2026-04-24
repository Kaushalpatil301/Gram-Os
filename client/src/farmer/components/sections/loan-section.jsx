import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, ExternalLink } from "lucide-react";
import { useProfile } from "../../../contexts/useProfile";
import {
  getCachedTrustLoanData,
  prefetchTrustLoanData,
} from "../../../lib/trustLoanCache";

export default function LoanSection() {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user, profile } = useProfile();
  const rawRole = user?.role || "farmer";
  const role = rawRole === "worker" ? "villager" : rawRole;

  const [credit, setCredit] = useState({ score: 0 });
  const [maxLoanAmount, setMaxLoanAmount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadLoanData = async () => {
      setLoading(true);
      try {
        const cached = getCachedTrustLoanData(user);
        const data = cached || (await prefetchTrustLoanData({ user, profile }));

        if (!cancelled) {
          setBanks(data?.banks || []);
          setCredit(data?.credit || { score: 0 });
          setMaxLoanAmount(data?.maxLoanAmount || 0);
        }
      } catch (error) {
        console.error("Failed to fetch loan data", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadLoanData();

    return () => {
      cancelled = true;
    };
  }, [user, profile]);

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        {loading ? (
          <div className="animate-pulse grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 bg-gray-100 rounded-2xl w-full"
              ></div>
            ))}
          </div>
        ) : (
          <div className="space-y-10">
            {/* Eligible Banks Grouped */}
            {(() => {
              const eligible = banks.filter(
                (b) =>
                  (b.minScore || 0) <= credit.score &&
                  (
                    b.allowedRoles || ["farmer", "retailer", "villager"]
                  ).includes(role),
              );
              if (eligible.length === 0) {
                return (
                  <Card className="border-0 shadow-md">
                    <CardContent className="p-10 text-center">
                      <p className="text-gray-500 italic">
                        No banks available for your current score.
                      </p>
                    </CardContent>
                  </Card>
                );
              }

              const groups = [
                {
                  id: "qr",
                  label: "📱 QR & Cash Advances",
                  items: eligible.filter((b) => b.type === "qr"),
                  classes: {
                    title: "text-emerald-600",
                    activeBorder: "border-emerald-200",
                    btnText: "text-white hover:bg-emerald-700 bg-emerald-600",
                  },
                },
                {
                  id: "growth",
                  label: "🚀 Growth & Expansion",
                  items: eligible.filter((b) => b.type === "growth"),
                  classes: {
                    title: "text-blue-600",
                    activeBorder: "border-blue-200",
                    btnText: "text-white hover:bg-blue-700 bg-blue-600",
                  },
                },
                {
                  id: "standard",
                  label: "🏦 Standard Loans",
                  items: eligible.filter(
                    (b) => b.type === "standard" || !b.type,
                  ),
                  classes: {
                    title: "text-amber-600",
                    activeBorder: "border-amber-200",
                    btnText: "text-white hover:bg-amber-700 bg-amber-600",
                  },
                },
              ];

              return groups.map(
                (group) =>
                  group.items.length > 0 && (
                    <div key={group.id} className="space-y-4">
                      <h3
                        className={`text-sm font-bold uppercase tracking-wider ${group.classes.title}`}
                      >
                        {group.label}
                      </h3>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {group.items.map((bank) => (
                          <Card
                            key={bank.id}
                            className="border border-gray-200 shadow-sm hover:shadow-xl transition-all overflow-hidden group"
                          >
                            <CardContent className="p-5 flex flex-col h-full">
                              <div className="flex gap-4 items-start mb-4">
                                <span className="text-3xl bg-gray-50 p-2.5 rounded-2xl border border-gray-100 group-hover:scale-110 transition-transform">
                                  {bank.logo}
                                </span>
                                <div>
                                  <p className="font-bold text-gray-900 leading-tight">
                                    {bank.name}
                                  </p>
                                  <Badge
                                    variant="secondary"
                                    className="mt-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium border-0"
                                  >
                                    Interest from {bank.interestRate}%
                                  </Badge>
                                </div>
                              </div>

                              <p className="text-sm text-gray-600 flex-grow leading-relaxed mb-6">
                                {bank.description || "Standard loan product."}
                              </p>

                              {bank.applyLink && (
                                <a
                                  href={bank.applyLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`w-full text-sm font-bold flex items-center justify-center gap-2 py-3 rounded-xl transition-colors ${group.classes.btnText}`}
                                >
                                  Apply Direct{" "}
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ),
              );
            })()}

            {/* Ineligible Banks */}
            <div className="pt-8 border-t border-gray-200 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                  Improve Credit Score to Unlock
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Loan eligibility is directly based on your Trust & Reliability
                  Score. A good score demonstrates high credibility,
                  significantly increasing your chances of loan approval.
                  Improve your score to unlock these financial products.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {banks
                  .filter(
                    (b) =>
                      (b.minScore || 0) > credit.score ||
                      !(
                        b.allowedRoles || ["farmer", "retailer", "villager"]
                      ).includes(role),
                  )
                  .map((bank) => {
                    const allowedRoles = bank.allowedRoles || [
                      "farmer",
                      "retailer",
                      "villager",
                    ];
                    const roleMismatch = !allowedRoles.includes(role);
                    return (
                      <Card
                        key={bank.id}
                        className="border border-gray-100 bg-gray-50/80 opacity-60 grayscale hover:grayscale-0 transition-all duration-300"
                      >
                        <CardContent className="p-5">
                          <div className="flex gap-4 items-start">
                            <span className="text-3xl bg-white p-2.5 rounded-2xl border border-gray-100">
                              {bank.logo}
                            </span>
                            <div>
                              <p className="font-semibold text-gray-600">
                                {bank.name}
                              </p>
                              <p className="text-xs text-red-500 font-bold mt-1.5">
                                {roleMismatch
                                  ? `Only available to: ${allowedRoles.join(", ")}`
                                  : `Requires Trust Score of ${bank.minScore || 0}`}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

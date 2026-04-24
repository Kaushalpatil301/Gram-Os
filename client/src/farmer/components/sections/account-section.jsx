import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { useTranslation } from "../../../consumer/i18n/config.jsx";

export default function AccountSection({ reports }) {
  const { t } = useTranslation();

  const getReasonLabel = (v) => {
    switch (v) {
      case "unfair-pricing":
        return t("farmer.reportReason.unfairPricing");
      case "delayed-payments":
        return t("farmer.reportReason.delayedPayments");
      case "fraudulent-activities":
        return t("farmer.reportReason.fraudulentActivities");
      default:
        return v
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold">{t("farmer.account.title")}</h2>
      <p className="text-muted-foreground">{t("farmer.account.subtitle")}</p>

      <div className="mt-4 grid md:grid-cols-2 gap-4">
        <Card className="bg-background/60 backdrop-blur">
          <CardHeader>
            <CardTitle>{t("farmer.account.profile")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <div>
              <span className="font-medium">{t("farmer.account.nameLabel")}</span> Demo Farmer
            </div>
            <div>
              <span className="font-medium">{t("farmer.account.localityLabel")}</span> Nashik, MH
            </div>
            <div>
              <span className="font-medium">{t("farmer.account.verificationLabel")}</span>{" "}
              <Badge variant="outline" className="border-emerald-500 text-emerald-700">
                {t("farmer.account.verification.onChain")}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/60 backdrop-blur">
          <CardHeader>
            <CardTitle>{t("farmer.account.recentReports")}</CardTitle>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("farmer.account.noReports")}</p>
            ) : (
              <ul className="grid gap-2">
                {reports.slice(0, 5).map((r) => (
                  <li key={r.id} className="text-sm">
                    <span className="font-medium">{r.party}</span> — {getReasonLabel(r.reason)}
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

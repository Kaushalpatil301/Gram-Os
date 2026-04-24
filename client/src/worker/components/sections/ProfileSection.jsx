import React from "react";
import { MapPin, BadgeCheck, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fmtMoney } from "../../lib/data";

export default function ProfileSection({ villagerProfile }) {
  const displayName = "Profile";

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-2xl font-bold text-emerald-700 shrink-0">
              {displayName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {displayName}
                </h2>
                {villagerProfile.verified && (
                  <BadgeCheck className="w-5 h-5 text-green-600" />
                )}
              </div>
              <div className="flex items-center gap-1 text-gray-600 mt-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{villagerProfile.location}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {villagerProfile.badges.map((b) => (
                  <Badge
                    key={b.id}
                    className="bg-emerald-50 text-emerald-700 border-emerald-200"
                  >
                    <Award className="w-3 h-3 mr-1" />
                    {b.title}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6 text-center shrink-0">
            <div>
              <div className="text-3xl font-bold text-gray-900">
                {villagerProfile.gigScore}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Gig Score</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">
                {villagerProfile.gigsCompleted}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Gigs Done</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {fmtMoney(villagerProfile.seasonEarnings)}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                Season Earnings
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import React from "react";
import { AlertTriangle, IndianRupee, Clock, MapPin, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fmtMoney } from "../../lib/data";

export default function AlertSection({ urgentJob, onApply }) {
  if (!urgentJob) return null;

  return (
    <Card className="border-0 shadow-md bg-amber-50 border-l-4 border-l-amber-400">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-semibold text-amber-700">
                Nearby Urgent Job
              </h3>
            </div>
            <p className="text-amber-800 font-medium">
              {urgentJob.cropType} • {urgentJob.farmerName} •{" "}
              {urgentJob.location}
            </p>
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-amber-900">
              <span className="flex items-center gap-1">
                <IndianRupee className="w-4 h-4" />
                {fmtMoney(urgentJob.payPerDay)}/day
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {urgentJob.durationDays} days
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {urgentJob.distanceKm} km away
              </span>
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {urgentJob.expiresIn} left
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
              Match {urgentJob.skillMatchPercent}%
            </Badge>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => onApply("Applied to urgent job!")}
            >
              Apply <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

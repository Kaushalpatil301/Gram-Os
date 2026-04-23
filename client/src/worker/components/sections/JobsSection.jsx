import React, { useState } from "react";
import {
  IndianRupee, Clock, MapPin, Users, Mic, MicOff, Filter,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fmtMoney, RAW_JOBS } from "../../lib/data";

export default function JobsSection({
  jobs,
  cropFilter,
  setCropFilter,
  maxDistance,
  setMaxDistance,
  voiceQuery,
  setVoiceQuery,
  isListening,
  toggleVoice,
  showNotification,
}) {
  const cropTypes = ["all", ...new Set(RAW_JOBS.map((j) => j.cropType))];

  return (
    <>
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Nearby Jobs</h3>
          <p className="text-sm text-gray-600">
            Ranked by skill match and distance
          </p>
        </div>
        {/* Voice search */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleVoice}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
              isListening
                ? "bg-red-50 border-red-300 text-red-600"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {isListening ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
            {isListening ? "Listening…" : "Voice Search"}
          </button>
          {voiceQuery && (
            <button
              onClick={() => setVoiceQuery("")}
              className="text-xs text-gray-500 underline"
            >
              Clear "{voiceQuery}"
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-5 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-600">Filters:</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Crop:</label>
          <select
            value={cropFilter}
            onChange={(e) => setCropFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            {cropTypes.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All crops" : c}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Max distance:</label>
          <input
            type="range"
            min={5}
            max={50}
            step={5}
            value={maxDistance}
            onChange={(e) => setMaxDistance(Number(e.target.value))}
            className="w-28"
          />
          <span className="text-sm font-medium text-gray-700 w-12">
            {maxDistance} km
          </span>
        </div>
      </div>

      {jobs.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-10 text-center text-gray-500">
            No jobs match your current filters. Try increasing distance or
            clearing the crop filter.
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <Card
              key={job.id}
              className="border-0 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {job.cropType}
                      </h4>
                      <Badge
                        className={
                          job.skillMatchPercent >= 80
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : job.skillMatchPercent >= 50
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-gray-100 text-gray-600 border-gray-200"
                        }
                      >
                        Match {job.skillMatchPercent}%
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      by {job.farmerName} • {job.location}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-700">
                      <span className="flex items-center gap-1">
                        <IndianRupee className="w-4 h-4" />
                        {fmtMoney(job.payPerDay)}/day
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {job.durationDays} days
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.distanceKm} km
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {job.spotsLeft} spots
                      </span>
                    </div>
                    {job.requiredBadges.length > 0 && (
                      <div className="mt-3 flex gap-2 flex-wrap">
                        {job.requiredBadges.map((rb) => (
                          <Badge key={rb} variant="outline" className="text-xs">
                            {rb}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-3 shrink-0">
                    <div className="text-xs text-gray-400">
                      {job.expiresIn} left
                    </div>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() =>
                        showNotification(`Applied to ${job.cropType}!`)
                      }
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

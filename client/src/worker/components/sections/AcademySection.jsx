import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AcademySection({ modules, onAdvance }) {
  return (
    <>
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900">Skill Academy</h3>
        <p className="text-sm text-gray-600">
          Complete modules to unlock better-paying gigs
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {modules.map((m) => (
          <Card key={m.id} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">{m.title}</h4>
                    {m.progressPercent === 100 && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                  </div>
                  <div className="mt-1 text-sm text-emerald-700 font-medium">
                    {m.unlocksJobTier}
                  </div>
                  <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        m.progressPercent === 100
                          ? "bg-emerald-500"
                          : "bg-green-400"
                      }`}
                      style={{ width: `${m.progressPercent}%` }}
                    />
                  </div>
                  <div className="mt-1.5 flex justify-between text-xs text-gray-500">
                    <span>{m.progressPercent}% complete</span>
                    <span>~{m.estimatedMinutes} min</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() => onAdvance(m.id)}
                  disabled={m.progressPercent === 100}
                >
                  {m.progressPercent === 100
                    ? "Done"
                    : m.progressPercent === 0
                    ? "Start"
                    : "Continue"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

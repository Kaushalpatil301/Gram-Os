import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SchemesSection({ schemeLang, showNotification }) {
  return (
    <>
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900">
          {schemeLang.title}
        </h3>
        <p className="text-sm text-gray-600">
          Auto-matched schemes based on your profile
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {schemeLang.schemes.map((s) => (
          <Card key={s.id} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="text-base font-semibold text-gray-900">
                    {s.name}
                  </div>
                  <div className="mt-2 text-sm text-gray-600 font-medium">
                    {schemeLang.docsNeeded}:
                  </div>
                  <ul className="mt-2 space-y-1.5">
                    {s.docs.map((d) => (
                      <li
                        key={d}
                        className="flex items-center gap-2 text-sm text-gray-700"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 shrink-0"
                  onClick={() =>
                    showNotification(`Opening: ${s.name}`)
                  }
                >
                  {schemeLang.apply}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

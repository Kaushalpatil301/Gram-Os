import React from "react";
import { BookOpen, TrendingUp, Star, Play, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function NptelSection({ courses, showNotification }) {
  return (
    <>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-900">
              NPTEL Courses
            </h3>
          </div>
          <p className="text-sm text-gray-600 mt-0.5">
            Free certified courses from IITs and IIMs — matched to your gig
            types
          </p>
        </div>
        <Badge className="bg-blue-50 text-blue-700 border-blue-200 shrink-0 mt-1">
          Free &amp; Certified
        </Badge>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((c) => (
          <Card
            key={c.id}
            className="border-0 shadow-sm hover:shadow-md transition-shadow flex flex-col"
          >
            <CardContent className="p-5 flex flex-col h-full">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-semibold text-gray-900 leading-snug">
                  {c.title}
                </h4>
                <div className="flex items-center gap-0.5 shrink-0 text-amber-500 text-xs font-semibold">
                  <Star className="w-3 h-3 fill-amber-500" />
                  {c.rating}
                </div>
              </div>
              <div className="text-sm text-blue-600 font-medium">
                {c.institute}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  {c.duration}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {c.level}
                </Badge>
              </div>
              <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-500 shrink-0" />
                Relevant for: {c.relevance}
              </div>
              <div className="mt-auto pt-4">
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    showNotification(`Opening: ${c.title}`)
                  }
                  className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg border border-blue-200 text-blue-700 text-sm font-medium hover:bg-blue-50 transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  Enroll on NPTEL
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

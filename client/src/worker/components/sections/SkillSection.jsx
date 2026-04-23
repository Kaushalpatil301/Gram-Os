import React from "react";
import {
  CheckCircle2,
  BookOpen,
  TrendingUp,
  Star,
  Play,
  ExternalLink,
} from "lucide-react";

// ─── Minimal inline primitives (no shadcn dependency issues) ──────────────────
function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl ${className}`}>{children}</div>
  );
}
function CardContent({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}
function Badge({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}
    >
      {children}
    </span>
  );
}
function Button({ children, onClick, disabled, className = "", variant = "solid" }) {
  const base =
    "inline-flex items-center justify-center rounded-lg text-sm font-semibold px-3.5 py-1.5 transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed select-none";
  const styles =
    variant === "outline"
      ? "border border-gray-200 text-gray-700 hover:bg-gray-50"
      : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-200";
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
// Props:
//   modules          — array from INTERNAL_MODULES (mapped with progressPercent)
//   courses          — array from NPTEL_COURSES
//   onAdvance(id)    — called when Start/Continue is clicked on a module
//   showNotification — global notification fn

export default function SkillSection({ modules = [], courses = [], onAdvance, showNotification }) {
  return (
    <div className="space-y-14">

      {/* ── Skill Academy ─────────────────────────────────────────── */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 font-['DM_Sans']">
            Skill Academy
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Complete modules to unlock better-paying gigs
          </p>
        </div>

        {modules.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No modules available.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {modules.map((m) => {
              const done = m.progressPercent === 100;
              const started = m.progressPercent > 0 && !done;
              return (
                <Card key={m.id} className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Title row */}
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900 font-['DM_Sans'] truncate">
                            {m.title}
                          </h4>
                          {done && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          )}
                        </div>

                        {/* Job tier unlock label */}
                        {m.unlocksJobTier && (
                          <p className="mt-0.5 text-xs font-medium text-emerald-600">
                            🔓 Unlocks: {m.unlocksJobTier}
                          </p>
                        )}

                        {/* Progress bar */}
                        <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              done ? "bg-emerald-500" : "bg-green-400"
                            }`}
                            style={{ width: `${m.progressPercent ?? 0}%` }}
                          />
                        </div>

                        {/* Progress label */}
                        <div className="mt-1.5 flex justify-between text-xs text-gray-400">
                          <span>{m.progressPercent ?? 0}% complete</span>
                          {m.estimatedMinutes && (
                            <span>~{m.estimatedMinutes} min</span>
                          )}
                        </div>
                      </div>

                      {/* CTA button */}
                      <Button
                        variant="outline"
                        onClick={() => onAdvance?.(m.id)}
                        disabled={done}
                        className="shrink-0 mt-0.5"
                      >
                        {done ? "Done ✓" : started ? "Continue" : "Start"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ── NPTEL Courses ─────────────────────────────────────────── */}
      <div>
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600 shrink-0" />
              <h2 className="text-2xl font-bold text-gray-900 font-['DM_Sans']">
                NPTEL Courses
              </h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Free certified courses from IITs &amp; IIMs — matched to your gig types
            </p>
          </div>
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 shrink-0 mt-1 whitespace-nowrap">
            Free &amp; Certified
          </Badge>
        </div>

        {courses.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No courses available.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((c) => (
              <Card
                key={c.id}
                className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <CardContent className="p-5 flex flex-col h-full">
                  {/* Title + rating */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 leading-snug font-['DM_Sans']">
                      {c.title}
                    </h4>
                    {c.rating && (
                      <div className="flex items-center gap-0.5 shrink-0 text-amber-500 text-xs font-semibold">
                        <Star className="w-3 h-3 fill-amber-500" />
                        {c.rating}
                      </div>
                    )}
                  </div>

                  {/* Institute */}
                  {c.institute && (
                    <p className="text-sm text-blue-600 font-medium">{c.institute}</p>
                  )}

                  {/* Tags */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {c.duration && (
                      <Badge className="bg-gray-50 text-gray-600 border-gray-200 text-xs">
                        {c.duration}
                      </Badge>
                    )}
                    {c.level && (
                      <Badge className="bg-gray-50 text-gray-600 border-gray-200 text-xs">
                        {c.level}
                      </Badge>
                    )}
                  </div>

                  {/* Relevance */}
                  {c.relevance && (
                    <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-500 shrink-0" />
                      Relevant for: {c.relevance}
                    </div>
                  )}

                  {/* Enroll button — pushed to bottom */}
                  <div className="mt-auto pt-4">
                    <a
                      href={c.url ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => showNotification?.(`Opening: ${c.title}`)}
                      className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl border border-blue-200 text-blue-700 text-sm font-medium hover:bg-blue-50 transition-colors"
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
        )}
      </div>
    </div>
  );
}
import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../../../lib/api";
import { useProfile } from "../../../contexts/useProfile";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users, Briefcase, Plus, X, MapPin, Clock, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, Search, Phone, Loader2, Send
} from "lucide-react";
import { useTranslation } from "../../../consumer/i18n/config.jsx";

const INITIALS = (name = "") => name.split(" ").map(n => n[0]).join("").toUpperCase() || "?";
const COLORS = ["bg-orange-100 text-orange-700","bg-blue-100 text-blue-700","bg-emerald-100 text-emerald-700","bg-purple-100 text-purple-700","bg-rose-100 text-rose-700"];
const colorFor = (str = "") => COLORS[str.charCodeAt(0) % COLORS.length];

// ─── Shared badge helper ──────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = { open:"bg-emerald-100 text-emerald-700", filled:"bg-blue-100 text-blue-700", closed:"bg-gray-100 text-gray-500", pending:"bg-amber-100 text-amber-700", hired:"bg-emerald-100 text-emerald-700", rejected:"bg-red-100 text-red-600" };
  const { t } = useTranslation();
  const key = `workforce.status.${String(status || "").toLowerCase()}`;
  const label = t(key);
  return (
    <span
      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${map[status] || "bg-gray-100 text-gray-500"}`}
    >
      {label === key ? status : label}
    </span>
  );
};

const MOCK_JOBS = [
  { _id: "m1", title: "Harvesting Wheat", type: "Farming", skills: ["Harvesting", "Manual Labor"], pay: "₹500/day", location: "Pune District", duration: "5 days", workers: 10, description: "Need 10 strong workers for wheat harvesting over the next 5 days. Lunch will be provided on site.", status: "open", applicationCount: 2, postedBy: { username: "ram_singh" } },
  { _id: "m2", title: "Warehouse Sorting", type: "Retail", skills: ["Sorting", "Packing"], pay: "₹450/day", location: "Mumbai City", duration: "Ongoing", workers: 3, description: "Sorting and packing fresh produce in warehouse. Experience with fragile items preferred.", status: "open", applicationCount: 5, postedBy: { username: "fresh_mart" } },
];

// ─── Post Job Modal ──────────────────────────────────────────────────────────
function PostJobModal({ onClose, onCreated, role }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ title:"", type:"", skills:"", location:"", pay:"", workers:1, duration:"", description:"" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setLoading(true);
    try {
      const data = await apiFetch("/jobs", {
        method: "POST",
        body: JSON.stringify({ ...form, skills: form.skills.split(",").map(s=>s.trim()).filter(Boolean) }),
      });
      onCreated(data.data);
      onClose();
    } catch (e) { setErr(e.message || t("workforce.postJob.error")); }
    finally { setLoading(false); }
  };

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const placeholders = role === "retailer"
    ? {
        title: t("workforce.postJob.placeholder.retailer.title"),
        type: t("workforce.postJob.placeholder.retailer.type"),
        skills: t("workforce.postJob.placeholder.retailer.skills"),
        pay: t("workforce.postJob.placeholder.retailer.pay"),
      }
    : {
        title: t("workforce.postJob.placeholder.farmer.title"),
        type: t("workforce.postJob.placeholder.farmer.type"),
        skills: t("workforce.postJob.placeholder.farmer.skills"),
        pay: t("workforce.postJob.placeholder.farmer.pay"),
      };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-orange-600"/>
            {t("workforce.postJob.modalTitle")}
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500"/></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          {err && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{err}</p>}
          {[
            ["title", t("workforce.postJob.field.title"), placeholders.title],
            ["type", t("workforce.postJob.field.type"), placeholders.type],
            ["skills", t("workforce.postJob.field.skills"), placeholders.skills],
            ["pay", t("workforce.postJob.field.pay"), placeholders.pay],
            ["location", t("workforce.postJob.field.location"), t("workforce.postJob.field.location.placeholder")],
            ["duration", t("workforce.postJob.field.duration"), t("workforce.postJob.field.duration.placeholder")],
          ].map(([k,label,ph]) => (
            <div key={k}>
              <label className="block text-xs font-bold text-gray-600 mb-1">{label}</label>
              <input required={["title","type","pay"].includes(k)} value={form[k]} onChange={f(k)} placeholder={ph} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"/>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">{t("workforce.postJob.field.workers")}</label>
              <input type="number" min={1} value={form.workers} onChange={f("workers")} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"/>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">{t("workforce.postJob.field.description")}</label>
            <textarea value={form.description} onChange={f("description")} rows={3} placeholder={t("workforce.postJob.field.description.placeholder")} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"/>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4"/>}
            {loading ? t("workforce.postJob.state.posting") : t("workforce.postJob.state.post")}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Job Details Modal (Villager) ───────────────────────────────────────────
function JobDetailsModal({ job, onClose, onApplied, alreadyApplied }) {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setLoading(true);
    // If it's a mock job, simulate success
    if (job._id.startsWith("m")) {
      setTimeout(() => {
        onApplied(job._id);
        onClose();
      }, 800);
      return;
    }
    
    try {
      await apiFetch(`/jobs/${job._id}/apply`, { method:"POST", body: JSON.stringify({ message }) });
      onApplied(job._id);
      onClose();
    } catch (e) { setErr(e.message || t("workforce.apply.error")); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-lg font-bold text-gray-900">{t("workforce.jobDetails.title")}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500"/></button>
        </div>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            {job.type} ·{" "}
            {t("workforce.jobDetails.postedBy", { username: job.postedBy?.username || t("workforce.jobDetails.defaultPoster") })}
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
              <p className="text-[10px] uppercase font-bold text-emerald-600 mb-1">{t("workforce.jobDetails.pay")}</p>
              <p className="font-bold text-emerald-900">{job.pay}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
              <p className="text-[10px] uppercase font-bold text-blue-600 mb-1">{t("workforce.jobDetails.location")}</p>
              <p className="font-bold text-blue-900">{job.location || t("workforce.jobDetails.na")}</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
              <p className="text-[10px] uppercase font-bold text-orange-600 mb-1">{t("workforce.jobDetails.duration")}</p>
              <p className="font-bold text-orange-900">{job.duration || t("workforce.jobDetails.na")}</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
              <p className="text-[10px] uppercase font-bold text-purple-600 mb-1">{t("workforce.jobDetails.workersNeeded")}</p>
              <p className="font-bold text-purple-900">{job.workers}</p>
            </div>
          </div>
          
          {job.description && (
            <div className="mb-6">
              <h4 className="text-xs font-bold text-gray-900 uppercase mb-2">{t("workforce.jobDetails.description")}</h4>
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl">{job.description}</p>
            </div>
          )}

          {job.skills?.length > 0 && (
            <div className="mb-6">
              <h4 className="text-xs font-bold text-gray-900 uppercase mb-2">{t("workforce.jobDetails.requiredSkills")}</h4>
              <div className="flex flex-wrap gap-2">
                {job.skills.map(s => <span key={s} className="text-xs font-bold bg-gray-100 text-gray-700 px-3 py-1 rounded-full">{s}</span>)}
              </div>
            </div>
          )}
          
          <hr className="my-6 border-gray-100" />
          
          {alreadyApplied ? (
            <div className="bg-blue-50 text-blue-700 font-bold p-4 rounded-xl text-center">
              {t("workforce.jobDetails.appliedAlready")}
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              {err && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{err}</p>}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">{t("workforce.jobDetails.messageLabel")}</label>
                <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={3} placeholder={t("workforce.jobDetails.messagePlaceholder")} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"/>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60 text-lg">
                {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Send className="w-5 h-5"/>}
                {loading ? t("workforce.apply.state.applying") : t("workforce.apply.submit")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Job Card (Employer view) ─────────────────────────────────────────────────
function EmployerJobCard({ job, onStatusChange, onClose }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const updateApp = async (jobId, appId, status) => {
    setActionLoading(appId);
    try {
      const data = await apiFetch(`/jobs/${jobId}/applications/${appId}`, { method:"PATCH", body: JSON.stringify({ status }) });
      onStatusChange(data.data);
    } catch(e){ console.error(e); }
    finally { setActionLoading(null); }
  };

  const closeJob = async () => {
    try {
      const data = await apiFetch(`/jobs/${job._id}/close`, { method:"PATCH" });
      onClose(data.data);
    } catch(e){ console.error(e); }
  };

  const pending = (job.applications||[]).filter(a=>a.status==="pending");
  const hired   = (job.applications||[]).filter(a=>a.status==="hired");

  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h4 className="font-bold text-gray-900">{job.title}</h4>
            <p className="text-xs text-gray-500 mt-0.5">{job.type} · {job.location} · {job.pay}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge status={job.status}/>
            {job.status === "open" && (
              <button onClick={closeJob} className="text-[10px] text-gray-400 hover:text-red-500 border border-gray-200 rounded px-1.5 py-0.5 transition-colors">{t("workforce.employer.close")}</button>
            )}
          </div>
        </div>
        <div className="flex gap-4 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5"/>{" "}
            {t("workforce.employer.hiredCount", { hired: hired.length, total: job.workers })}
          </span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> {job.duration || t("workforce.jobDetails.na")}</span>
          <span className="text-amber-600 font-bold">{t("workforce.employer.pendingCount", { count: pending.length })}</span>
        </div>
        {job.applications?.length > 0 && (
          <button onClick={()=>setExpanded(!expanded)} className="w-full text-xs font-bold text-blue-600 flex items-center justify-center gap-1 py-2 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
            {expanded ? <ChevronUp className="w-3.5 h-3.5"/> : <ChevronDown className="w-3.5 h-3.5"/>}
            {expanded ? t("workforce.employer.hide") : t("workforce.employer.viewApplicants", { count: job.applications.length })}
          </button>
        )}
        {expanded && (
          <div className="mt-3 space-y-2">
            {(job.applications||[]).map(app => (
              <div key={app._id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${colorFor(app.applicant?.username || "")}`}>
                    {INITIALS(app.applicant?.username || "?")}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{app.applicant?.username || t("workforce.employer.unknownUser")}</p>
                    {app.message && <p className="text-xs text-gray-500 italic">"{app.message}"</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={app.status}/>
                  {app.status === "pending" && (
                    <div className="flex gap-1">
                      <button onClick={()=>updateApp(job._id, app._id, "hired")} disabled={actionLoading===app._id} className="p-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition-colors">
                        {actionLoading===app._id ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <CheckCircle2 className="w-3.5 h-3.5"/>}
                      </button>
                      <button onClick={()=>updateApp(job._id, app._id, "rejected")} disabled={actionLoading===app._id} className="p-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors">
                        <XCircle className="w-3.5 h-3.5"/>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Villager Job Browse Card ────────────────────────────────────────────────
function VillagerJobCard({ job, alreadyApplied, onApply }) {
  const { t } = useTranslation();
  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow-lg transition-all group overflow-hidden">
      <CardContent className="p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{job.title}</h4>
            <p className="text-xs text-gray-500 mt-0.5">{job.type}</p>
          </div>
          <StatusBadge status={job.status}/>
        </div>
        {job.description && <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{job.description}</p>}
        <div className="flex flex-wrap gap-1">
          {(job.skills||[]).map(s => (
            <span key={s} className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{s}</span>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-gray-400"/>{job.location || t("workforce.jobDetails.na")}</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-gray-400"/>{job.duration || t("workforce.jobDetails.na")}</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-auto">
          <span className="text-base font-black text-emerald-700">{job.pay}</span>
          {alreadyApplied
            ? <button onClick={()=>onApply(job)} className="text-sm font-bold text-blue-600 bg-blue-50 px-4 py-1.5 rounded-xl">{t("workforce.villager.viewApplied")}</button>
            : <button onClick={()=>onApply(job)} className="text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-xl transition-colors">{t("workforce.villager.viewDetails")}</button>
          }
        </div>
        <p className="text-[10px] text-gray-400">
          {t("workforce.villager.appliedLine", {
            count: job.applicationCount ?? (job.applications?.length ?? 0),
            username: job.postedBy?.username || t("workforce.jobDetails.defaultPoster"),
          })}
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Worker Browse Card (Employer view) ──────────────────────────────────────
function WorkerCard({ worker }) {
  const { t } = useTranslation();
  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all">
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0 ${colorFor(worker.username||"")}`}>
          {worker.avatar?.url && !worker.avatar.url.includes("placehold")
            ? <img src={worker.avatar.url} className="w-12 h-12 rounded-2xl object-cover" alt=""/>
            : INITIALS(worker.username||"")}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 truncate">@{worker.username}</p>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3"/>{worker.location?.city || worker.location?.address || t("workforce.worker.locationNA")}
          </p>
        </div>
        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full shrink-0">{t("workforce.worker.roleLabel")}</span>
      </CardContent>
    </Card>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function WorkforceSection() {
  const { t } = useTranslation();
  const { user } = useProfile();
  const rawRole = user?.role || "farmer";
  const role = rawRole === "worker" ? "villager" : rawRole;
  const isEmployer = role === "farmer" || role === "retailer";
  const sectionTitleKey =
    role === "farmer"
      ? "farmer.nav.workforce"
      : role === "retailer"
        ? "retailer.nav.workforce"
        : "villager.nav.jobs";

  const [tab, setTab] = useState(isEmployer ? "my-jobs" : "browse");
  const [jobs, setJobs] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showPostModal, setShowPostModal] = useState(false);
  const [applyTarget, setApplyTarget] = useState(null);
  const [appliedIds, setAppliedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("appliedJobs") || "[]"); } catch { return []; }
  });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = isEmployer ? "/jobs/my-posted" : "/jobs";
      const data = await apiFetch(endpoint);
      if (isEmployer) {
        setJobs(data.data || []);
      } else {
        setJobs([...(data.data || []), ...MOCK_JOBS]);
      }
    } catch(e){ console.error(e); }
    finally { setLoading(false); }
  }, [isEmployer]);

  const fetchWorkers = useCallback(async () => {
    try {
      const data = await apiFetch("/jobs/workers");
      setWorkers(data.data || []);
    } catch(e){ console.error(e); }
  }, []);

  useEffect(() => {
    if (tab === "my-jobs" || tab === "browse") fetchJobs();
    if (tab === "workers") fetchWorkers();
  }, [tab, fetchJobs, fetchWorkers]);

  const handleJobCreated = (job) => setJobs(prev => [job, ...prev]);
  const handleStatusChange = (updatedJob) => setJobs(prev => prev.map(j => j._id===updatedJob._id ? updatedJob : j));
  const handleJobClose = (updatedJob) => setJobs(prev => prev.map(j => j._id===updatedJob._id ? updatedJob : j));
  const handleApplied = (jobId) => {
    const next = [...appliedIds, jobId];
    setAppliedIds(next);
    localStorage.setItem("appliedJobs", JSON.stringify(next));
  };

  const filteredJobs = jobs.filter(j =>
    !search || j.title?.toLowerCase().includes(search.toLowerCase()) || j.type?.toLowerCase().includes(search.toLowerCase()) || j.location?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredWorkers = workers.filter(w =>
    !search || w.username?.toLowerCase().includes(search.toLowerCase()) || w.location?.city?.toLowerCase().includes(search.toLowerCase())
  );

  const TABS = isEmployer
    ? [
        { id: "my-jobs", label: t("workforce.tabs.myJobs") },
        { id: "workers", label: t("workforce.tabs.browseWorkers") },
      ]
    : [{ id: "browse", label: t("workforce.tabs.browseJobs") }];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <div className="p-2 bg-orange-100 rounded-xl"><Users className="w-5 h-5 text-orange-700"/></div>
            {t(sectionTitleKey)}
          </h2>
          <p className="text-gray-500 mt-1 text-sm">
            {isEmployer
              ? t("retailer.section.workforce.subtitle.employer")
              : t("retailer.section.workforce.subtitle.worker")}
          </p>
        </div>
        {isEmployer && (
          <button onClick={()=>setShowPostModal(true)} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-4 py-2.5 rounded-xl transition-colors shadow-md">
            <Plus className="w-4 h-4"/> {t("workforce.postJob.button")}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab===t.id ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
        <input
          value={search}
          onChange={e=>setSearch(e.target.value)}
          placeholder={tab==="workers" ? t("workforce.search.workers") : t("workforce.search.jobs")}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-2xl"/>)}
        </div>
      ) : tab === "workers" ? (
        filteredWorkers.length === 0
          ? <p className="text-gray-500 italic py-10 text-center">{t("workforce.empty.workers")}</p>
          : <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWorkers.map(w => <WorkerCard key={w._id} worker={w}/>)}
            </div>
      ) : isEmployer ? (
        filteredJobs.length === 0
          ? <div className="text-center py-16 space-y-2">
              <Briefcase className="w-10 h-10 text-gray-300 mx-auto"/>
              <p className="text-gray-500 font-medium">{t("workforce.empty.myJobs.title")}</p>
              <button onClick={()=>setShowPostModal(true)} className="text-sm text-orange-600 font-bold hover:underline">{t("workforce.empty.myJobs.cta")}</button>
            </div>
          : <div className="space-y-4">
              {filteredJobs.map(j => <EmployerJobCard key={j._id} job={j} onStatusChange={handleStatusChange} onClose={handleJobClose}/>)}
            </div>
      ) : (
        filteredJobs.length === 0
          ? <p className="text-gray-500 italic py-10 text-center">{t("workforce.empty.browseJobs")}</p>
          : <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map(j => <VillagerJobCard key={j._id} job={j} alreadyApplied={appliedIds.includes(j._id)} onApply={setApplyTarget}/>)}
            </div>
      )}

      {/* Modals */}
      {showPostModal && <PostJobModal role={role} onClose={()=>setShowPostModal(false)} onCreated={handleJobCreated}/>}
      {applyTarget && <JobDetailsModal job={applyTarget} alreadyApplied={appliedIds.includes(applyTarget._id)} onClose={()=>setApplyTarget(null)} onApplied={handleApplied}/>}
    </div>
  );
}
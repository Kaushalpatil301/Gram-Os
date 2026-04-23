import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, MapPin, Briefcase, Plus, Star, Phone, Briefcase as BriefcaseIcon } from "lucide-react";

const MOCK_WORKERS = [
  { id: 1, name: "Suresh Jadhav", skills: ["Harvesting", "Pesticide Spraying"], rating: 4.6, gigs: 23, distance: "3 km", badge: "Expert Harvester", available: true },
  { id: 2, name: "Mangesh Patil", skills: ["Harvesting", "Irrigation"], rating: 4.3, gigs: 15, distance: "5 km", badge: "Irrigation Specialist", available: true },
  { id: 3, name: "Lata Bai", skills: ["Sorting", "Packing", "Grading"], rating: 4.8, gigs: 42, distance: "2 km", badge: "Quality Expert", available: true },
  { id: 4, name: "Anil Kumar", skills: ["Heavy Lifting", "Transport"], rating: 4.1, gigs: 8, distance: "7 km", badge: "New Worker", available: false },
];

const INITIALS = (name) => name.split(" ").map(n => n[0]).join("").toUpperCase();

const AVATAR_COLORS = ["bg-orange-100 text-orange-700", "bg-blue-100 text-blue-700", "bg-emerald-100 text-emerald-700", "bg-purple-100 text-purple-700"];

export default function WorkforceSection() {
  const [activeTab, setActiveTab] = useState("post");
  const [jobs, setJobs] = useState([
    { id: 1, crop: "Tomato", type: "Harvesting", workers: 5, duration: "3 days", pay: "₹450/day", location: "Koregaon, Pune", status: "Open", applied: 3, posted: "2 days ago" },
    { id: 2, crop: "Onion", type: "Sorting & Packing", workers: 3, duration: "2 days", pay: "₹400/day", location: "Koregaon, Pune", status: "Filled", applied: 5, posted: "5 days ago" },
  ]);
  const [newJob, setNewJob] = useState({ crop: "", type: "", workers: 1, duration: "", pay: "", location: "Koregaon, Pune" });
  const [showForm, setShowForm] = useState(false);

  const postJob = () => {
    if (!newJob.crop || !newJob.type || !newJob.pay) return;
    setJobs(prev => [{ ...newJob, id: Date.now(), status: "Open", applied: 0, posted: "Just now" }, ...prev]);
    setNewJob({ crop: "", type: "", workers: 1, duration: "", pay: "", location: "Koregaon, Pune" });
    setShowForm(false);
  };

  const openJobs = jobs.filter(j => j.status === "Open").length;
  const availableWorkers = MOCK_WORKERS.filter(w => w.available).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <div className="p-2 bg-orange-100 rounded-xl">
              <Users className="w-5 h-5 text-orange-700" />
            </div>
            Harvest Workforce Engine
          </h2>
          <p className="text-gray-500 mt-1 text-sm">Post harvest jobs and connect with skilled workers nearby.</p>
        </div>
        <Button
          onClick={() => { setShowForm(!showForm); setActiveTab("post"); }}
          className="bg-orange-600 hover:bg-orange-700 cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" /> Post New Job
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Jobs", value: jobs.length, color: "text-gray-800" },
          { label: "Open", value: openJobs, color: "text-emerald-600" },
          { label: "Workers Nearby", value: availableWorkers, color: "text-orange-600" },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-400 font-medium mt-0.5 uppercase tracking-wide">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 rounded-xl p-1.5">
        {[
          { id: "post", label: "📋 My Job Posts" },
          { id: "workers", label: "👷 Available Workers" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === tab.id ? "bg-white text-orange-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Job Posts Tab */}
      {activeTab === "post" && (
        <div className="space-y-4">

          {/* Post Job Form */}
          {showForm && (
            <Card className="border border-orange-200 bg-orange-50/40 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-gray-800">Post a Harvest Job</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { label: "Crop Type", key: "crop", placeholder: "e.g. Tomato", required: true },
                    { label: "Duration", key: "duration", placeholder: "e.g. 3 days" },
                    { label: "Pay Rate", key: "pay", placeholder: "e.g. ₹450/day", required: true },
                    { label: "Location", key: "location", placeholder: "" },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      <Input
                        className="mt-1 bg-white"
                        placeholder={field.placeholder}
                        value={newJob[field.key]}
                        onChange={e => setNewJob(p => ({ ...p, [field.key]: e.target.value }))}
                      />
                    </div>
                  ))}

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Job Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="mt-1 w-full h-10 rounded-md border border-gray-200 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
                      value={newJob.type}
                      onChange={e => setNewJob(p => ({ ...p, type: e.target.value }))}
                    >
                      <option value="">Select job type...</option>
                      <option>Harvesting</option>
                      <option>Sorting & Packing</option>
                      <option>Pesticide Spraying</option>
                      <option>Irrigation Setup</option>
                      <option>Loading & Transport</option>
                      <option>Weeding</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Workers Needed</label>
                    <Input
                      type="number"
                      className="mt-1 bg-white"
                      min={1}
                      value={newJob.workers}
                      onChange={e => setNewJob(p => ({ ...p, workers: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button onClick={postJob} className="bg-orange-600 hover:bg-orange-700 cursor-pointer">Post Job</Button>
                  <Button variant="outline" onClick={() => setShowForm(false)} className="cursor-pointer">Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Job List */}
          {jobs.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No jobs posted yet</p>
              <p className="text-sm mt-1">Click "Post New Job" to get started.</p>
            </div>
          ) : (
            jobs.map(job => (
              <Card
                key={job.id}
                className={`border-0 shadow-md hover:shadow-lg transition-shadow ${job.status === "Filled" ? "opacity-60" : ""}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-gray-900 text-base">{job.type}</h4>
                        <Badge className={job.status === "Open" ? "bg-emerald-100 text-emerald-700 border-0" : "bg-gray-100 text-gray-500 border-0"}>
                          {job.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {job.crop} &nbsp;·&nbsp; {job.duration}
                      </p>
                      <p className="text-lg font-bold text-orange-600 mt-1">{job.pay}</p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">{job.posted}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <div className="text-lg font-bold text-gray-800">{job.workers}</div>
                      <div className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide mt-0.5">Needed</div>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-3 text-center">
                      <div className="text-lg font-bold text-orange-600">{job.applied}</div>
                      <div className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide mt-0.5">Applied</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-center gap-1.5">
                      <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="text-xs text-gray-600 truncate">{job.location}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Workers Tab */}
      {activeTab === "workers" && (
        <div className="grid gap-4">
          {MOCK_WORKERS.map((w, idx) => (
            <Card
              key={w.id}
              className={`border-0 shadow-md hover:shadow-lg transition-shadow ${!w.available ? "opacity-55" : ""}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                      {INITIALS(w.name)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-gray-900">{w.name}</h4>
                        <Badge className="bg-orange-50 text-orange-700 border-orange-200 text-xs">{w.badge}</Badge>
                        {w.available
                          ? <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">Available</Badge>
                          : <Badge variant="outline" className="text-gray-400 text-xs">Busy</Badge>
                        }
                      </div>

                      {/* Stats Row */}
                      <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="font-semibold text-gray-700">{w.rating}</span>
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                          {w.gigs} gigs
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          {w.distance}
                        </span>
                      </div>

                      {/* Skills */}
                      <div className="flex gap-1.5 mt-2.5 flex-wrap">
                        {w.skills.map((s, i) => (
                          <Badge key={i} className="bg-gray-100 text-gray-600 border-0 text-xs font-medium">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {w.available && (
                    <div className="flex gap-2 items-center shrink-0">
                      <Button size="sm" variant="outline" className="text-xs cursor-pointer gap-1">
                        <Phone className="w-3 h-3" /> Call
                      </Button>
                      <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-xs cursor-pointer">
                        Hire
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
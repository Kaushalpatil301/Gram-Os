import { useState, useEffect } from "react";
import { X, User, Mail, Phone, MapPin, Camera, Save, Edit2, Award, Briefcase, BadgeCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_PROFILE } from "../lib/data.js";

const SKILL_OPTIONS = ["Harvesting", "Pesticide Use", "Irrigation Setup", "Drip Line", "Sorting & Grading", "Transplanting", "Land Preparation", "Spraying"];
const LANGUAGE_OPTIONS = ["Marathi", "Hindi", "English", "Kannada", "Telugu"];

function loadLS(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; } catch { return fallback; }
}

export default function WorkerProfileModal({ isOpen, onClose }) {
  const userRaw = loadLS("user", {});
  const savedBasic   = loadLS("userProfile", null);
  const savedWorker  = loadLS("workerProfile", null);
  const workerBase   = savedWorker ? { ...DEFAULT_PROFILE, ...savedWorker } : DEFAULT_PROFILE;

  // Shared state — synced between both tabs
  const [shared, setShared] = useState({
    name:     savedBasic?.name     || workerBase.name     || userRaw.name  || "Sunita Pawar",
    phone:    savedBasic?.phone    || userRaw.phone        || "+91 98765 43210",
    location: savedBasic?.location || workerBase.location || "Satara, Maharashtra",
  });

  // Basic Info only fields
  const [basic, setBasic] = useState({
    email:          savedBasic?.email          || userRaw.email || "worker@gramos.in",
    specialization: savedBasic?.specialization || "Harvest, Irrigation",
    experience:     savedBasic?.experience     || "5+ years",
    bio:            savedBasic?.bio            || "Experienced rural worker specializing in harvest and irrigation setups.",
  });

  // Worker Profile (LinkedIn-style) only fields
  const [worker, setWorker] = useState({
    aadhaarNumber: workerBase.aadhaarNumber || "XXXX XXXX 4567",
    language:      workerBase.language      || "Marathi",
    gigScore:      workerBase.gigScore      || 87,
    gigsCompleted: workerBase.gigsCompleted || 126,
    seasonEarnings:workerBase.seasonEarnings|| 72000,
    creditScore:   workerBase.creditScore   || 718,
    badges:        workerBase.badges        || DEFAULT_PROFILE.badges,
    skills:        workerBase.skills        || ["Harvesting", "Irrigation Setup", "Pesticide Use"],
  });

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("settings");
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && isOpen) onClose(); };
    
    const handleProfileUpdate = (e) => {
       const updates = e.detail || {};
       if (!updates) return;
       
       let updatedShared = { ...shared };
       let updatedBasic = { ...basic };
       let updatedWorker = { ...worker };
       
       Object.entries(updates).forEach(([k, v]) => {
          if (["name", "phone", "location"].includes(k)) updatedShared[k] = v;
          else if (["email", "specialization", "experience", "bio"].includes(k)) updatedBasic[k] = v;
          else updatedWorker[k] = v;
       });

       setShared(updatedShared);
       setBasic(updatedBasic);
       setWorker(updatedWorker);
       
       const mergedBasic  = { ...updatedShared, ...updatedBasic };
       const mergedWorker = { ...updatedShared, ...updatedWorker };
       localStorage.setItem("userProfile",   JSON.stringify(mergedBasic));
       localStorage.setItem("workerProfile", JSON.stringify(mergedWorker));
    };

    document.addEventListener("keydown", onKey);
    window.addEventListener("AGRIBOT_UPDATE_PROFILE", handleProfileUpdate);
    
    return () => {
       document.removeEventListener("keydown", onKey);
       window.removeEventListener("AGRIBOT_UPDATE_PROFILE", handleProfileUpdate);
    };
  }, [isOpen, onClose, shared, basic, worker]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const upShared = (key, val) => setShared(p => ({ ...p, [key]: val }));
  const upBasic  = (key, val) => setBasic(p  => ({ ...p, [key]: val }));
  const upWorker = (key, val) => setWorker(p => ({ ...p, [key]: val }));

  const toggleSkill = (skill) =>
    setWorker(p => ({
      ...p,
      skills: p.skills.includes(skill) ? p.skills.filter(s => s !== skill) : [...p.skills, skill],
    }));

  const handleSave = () => {
    const mergedBasic  = { ...shared, ...basic };
    const mergedWorker = { ...shared, ...worker };
    localStorage.setItem("userProfile",   JSON.stringify(mergedBasic));
    localStorage.setItem("workerProfile", JSON.stringify(mergedWorker));
    setIsEditing(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setProfileImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  const inputCls = "w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-700 disabled:border-0 disabled:font-medium";
  const labelCls = "text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1";

  const initials = shared.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-700 text-white px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Profile Settings</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-1 mt-4">
            {[{ id: "settings", label: "Basic Info" }, { id: "worker", label: "Worker Profile" }].map(tab => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setIsEditing(false); }}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? "bg-white text-emerald-700" : "text-white/70 hover:text-white hover:bg-white/10"}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">

          {/* ══ Basic Info ══ */}
          {activeTab === "settings" && (
            <>
              <div className="flex flex-col items-center space-y-3">
                <div className="relative">
                  <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center overflow-hidden">
                    {profileImage
                      ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                      : <span className="text-2xl font-bold text-emerald-700">{initials}</span>}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-emerald-600 text-white p-2 rounded-full cursor-pointer hover:bg-emerald-700 transition-colors">
                      <Camera className="w-4 h-4" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900">{shared.name}</h3>
                  <p className="text-sm text-gray-500">{basic.specialization}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><User className="w-4 h-4" />Full Name</label>
                  <input value={shared.name} onChange={e => upShared("name", e.target.value)} disabled={!isEditing} className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><Mail className="w-4 h-4" />Email Address</label>
                  <input type="email" value={basic.email} onChange={e => upBasic("email", e.target.value)} disabled={!isEditing} className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><Phone className="w-4 h-4" />Phone Number</label>
                  <input type="tel" value={shared.phone} onChange={e => upShared("phone", e.target.value)} disabled={!isEditing} className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><MapPin className="w-4 h-4" />Location</label>
                  <input value={shared.location} onChange={e => upShared("location", e.target.value)} disabled={!isEditing} className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Specialization</label>
                  <input value={basic.specialization} onChange={e => upBasic("specialization", e.target.value)} disabled={!isEditing} className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Experience</label>
                  <input value={basic.experience} onChange={e => upBasic("experience", e.target.value)} disabled={!isEditing} className={inputCls} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">About Me</label>
                <textarea value={basic.bio} onChange={e => upBasic("bio", e.target.value)} disabled={!isEditing} rows={3}
                  className={`${inputCls} resize-none`} placeholder="Tell about your work experience and skills..." />
              </div>
            </>
          )}

          {/* ══ Worker Profile (LinkedIn-style) ══ */}
          {activeTab === "worker" && (
            <>
              {/* LinkedIn-style banner */}
              <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-5 relative overflow-hidden">
                <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full" />
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center overflow-hidden text-2xl font-bold">
                      {profileImage
                        ? <img src={profileImage} alt="" className="w-full h-full object-cover" />
                        : <span className="text-emerald-100">{initials}</span>}
                    </div>
                    {worker.verified && (
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                        <BadgeCheck className="w-4 h-4 text-emerald-600" />
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{shared.name}</h3>
                    <p className="text-emerald-200 text-sm">{basic.specialization} · {basic.experience} exp</p>
                    <p className="text-emerald-200 text-sm flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />{shared.location}
                    </p>
                  </div>
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 shrink-0">
                    {[
                      { label: "Gig Score",  value: worker.gigScore },
                      { label: "Gigs Done",  value: worker.gigsCompleted },
                      { label: "Credit",     value: worker.creditScore },
                      { label: "Earnings",   value: `₹${(worker.seasonEarnings/1000).toFixed(0)}K` },
                    ].map((s, i) => (
                      <div key={i} className="bg-white/10 rounded-xl px-3 py-2 text-center">
                        <div className="text-base font-bold">{s.value}</div>
                        <div className="text-emerald-200 text-[10px] uppercase font-semibold tracking-wider">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Badges earned */}
              <div className="bg-gray-50 rounded-2xl p-5">
                <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-emerald-600" /> Earned Badges
                </h4>
                <div className="flex flex-wrap gap-2">
                  {worker.badges.map(b => (
                    <div key={b.id} className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5">
                      <Star className="w-3 h-3 text-emerald-600 fill-emerald-400" />
                      <span className="text-xs font-semibold text-emerald-700">{b.title}</span>
                      <span className="text-[10px] text-gray-400">{b.earnedDate}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="bg-gray-50 rounded-2xl p-5">
                <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
                  <Briefcase className="w-4 h-4 text-emerald-600" /> Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS.map(skill => (
                    <button key={skill} onClick={() => isEditing && toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                        (worker.skills || []).includes(skill)
                          ? "bg-emerald-600 text-white border-emerald-600 shadow"
                          : isEditing
                            ? "bg-white border-gray-300 text-gray-600 hover:border-emerald-400 cursor-pointer"
                            : "bg-gray-100 text-gray-400 border-gray-100"
                      }`}>
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Identity fields */}
              <div className="grid lg:grid-cols-2 gap-5">
                <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
                  <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2"><User className="w-4 h-4 text-emerald-600" />Personal Details</h4>

                  <div><label className={labelCls}>Full Name</label>
                    <input value={shared.name} onChange={e => upShared("name", e.target.value)} disabled={!isEditing} className={inputCls} /></div>
                  <div><label className={labelCls}>Phone Number</label>
                    <input value={shared.phone} onChange={e => upShared("phone", e.target.value)} disabled={!isEditing} className={inputCls} /></div>
                  <div><label className={labelCls}>Location</label>
                    <input value={shared.location} onChange={e => upShared("location", e.target.value)} disabled={!isEditing} className={inputCls} /></div>
                  <div><label className={labelCls}>Aadhaar Number</label>
                    <input value={worker.aadhaarNumber} onChange={e => upWorker("aadhaarNumber", e.target.value)} disabled={!isEditing} className={inputCls} /></div>
                  <div><label className={labelCls}>Language Preference</label>
                    <select value={worker.language} onChange={e => upWorker("language", e.target.value)} disabled={!isEditing} className={inputCls}>
                      {LANGUAGE_OPTIONS.map(l => <option key={l} value={l.toLowerCase()}>{l}</option>)}
                    </select>
                  </div>
                </div>

                {/* Work info */}
                <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
                  <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2"><Briefcase className="w-4 h-4 text-emerald-600" />Work Details</h4>
                  <div><label className={labelCls}>Specialization</label>
                    <input value={basic.specialization} onChange={e => upBasic("specialization", e.target.value)} disabled={!isEditing} className={inputCls} /></div>
                  <div><label className={labelCls}>Experience</label>
                    <input value={basic.experience} onChange={e => upBasic("experience", e.target.value)} disabled={!isEditing} className={inputCls} /></div>
                  <div><label className={labelCls}>Gig Score</label>
                    <input type="number" value={worker.gigScore} onChange={e => upWorker("gigScore", Number(e.target.value))} disabled={!isEditing} className={inputCls} /></div>
                  <div><label className={labelCls}>Loan Eligible</label>
                    <div className={`mt-1 flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${worker.loanEligible ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-gray-500"}`}>
                      <BadgeCheck className={`w-4 h-4 ${worker.loanEligible ? "text-green-600" : "text-gray-400"}`} />
                      {worker.loanEligible ? "Eligible for rural micro-loan" : "Not yet eligible"}
                    </div>
                  </div>
                  <div><label className={labelCls}>About Me</label>
                    <textarea value={basic.bio} onChange={e => upBasic("bio", e.target.value)} disabled={!isEditing} rows={3}
                      className={`${inputCls} resize-none`} placeholder="Tell about your skills..." />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-2xl flex justify-between items-center">
          {isEditing ? (
            <div className="flex gap-3">
              <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Changes
              </Button>
              <Button onClick={() => setIsEditing(false)} variant="outline" className="border-gray-300 text-gray-700">Cancel</Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2">
              <Edit2 className="w-4 h-4" /> Edit Profile
            </Button>
          )}
          <Button onClick={onClose} variant="outline" className="border-gray-300 text-gray-700">Close</Button>
        </div>
      </div>
    </div>
  );
}

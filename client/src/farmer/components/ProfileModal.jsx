import { useState, useEffect } from "react";
import { X, User, Mail, Phone, MapPin, Camera, Save, Edit2, Shield, Wheat, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const SOIL_TYPES = ["Black Cotton", "Red Soil", "Alluvial", "Laterite", "Sandy", "Clay", "Loamy"];
const IRRIGATION_TYPES = ["Drip", "Sprinkler", "Canal", "Well", "Rainfed", "Borewell"];
const CROP_OPTIONS = ["Tomato", "Onion", "Wheat", "Rice", "Sugarcane", "Cotton", "Soybean", "Banana", "Mango", "Potato", "Chilli", "Maize"];

const CROP_HISTORY = [
  { season: "Kharif 2025",  crop: "Tomato",    yield: "32 qtl",  soldTo: "APMC Pune",       revenue: "₹96,000",   rating: 4.5 },
  { season: "Rabi 2024-25", crop: "Wheat",     yield: "45 qtl",  soldTo: "ITC e-Choupal",   revenue: "₹1,12,500", rating: 4.2 },
  { season: "Kharif 2024",  crop: "Onion",     yield: "28 qtl",  soldTo: "APMC Nashik",     revenue: "₹56,000",   rating: 3.8 },
  { season: "Rabi 2023-24", crop: "Sugarcane", yield: "120 qtl", soldTo: "Vasantdada Coop", revenue: "₹3,60,000", rating: 4.7 },
];

function loadLS(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; } catch { return fallback; }
}

export default function ProfileModal({ isOpen, onClose }) {
  const userRaw = loadLS("user", {});

  // ── Shared state (synced between both tabs) ──
  const savedBasic = loadLS("userProfile", null);
  const savedFarm  = loadLS("farmerProfile", null);

  const [shared, setShared] = useState({
    name:  savedBasic?.name  || savedFarm?.name  || userRaw.name  || "Rajesh Sharma",
    phone: savedBasic?.phone || savedFarm?.phone || userRaw.phone || "+91 98765 43210",
    location: savedBasic?.location || "Pune, Maharashtra",
  });

  // Basic Info only fields
  const [basic, setBasic] = useState({
    email:    savedBasic?.email    || userRaw.email || "farmer@gramos.in",
    farmSize: savedBasic?.farmSize || "5 acres",
    crops:    savedBasic?.crops    || "Rice, Wheat, Sugarcane",
    bio:      savedBasic?.bio      || "Experienced farmer with 15+ years in sustainable agriculture",
  });

  // Farm Identity only fields
  const [farm, setFarm] = useState({
    village:       savedFarm?.village       || "Koregaon",
    district:      savedFarm?.district      || "Pune",
    state:         savedFarm?.state         || "Maharashtra",
    aadhaarLast4:  savedFarm?.aadhaarLast4  || "4521",
    landSizeAcres: savedFarm?.landSizeAcres || 5,
    soilType:      savedFarm?.soilType      || "Black Cotton",
    irrigationType:savedFarm?.irrigationType|| "Drip",
    primaryCrops:  savedFarm?.primaryCrops  || ["Tomato", "Onion", "Wheat"],
    upiId:         savedFarm?.upiId         || "rajesh@upi",
  });

  const [selectedCrops, setSelectedCrops] = useState(farm.primaryCrops);
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
       let updatedFarm = { ...farm };
       
       Object.entries(updates).forEach(([k, v]) => {
          if (["name", "phone", "location"].includes(k)) updatedShared[k] = v;
          else if (["email", "farmSize", "crops", "bio"].includes(k)) updatedBasic[k] = v;
          else updatedFarm[k] = v;
       });

       setShared(updatedShared);
       setBasic(updatedBasic);
       setFarm(updatedFarm);
       
       const mergedBasic = { ...updatedShared, ...updatedBasic };
       const mergedFarm  = { ...updatedShared, ...updatedFarm, primaryCrops: selectedCrops };
       localStorage.setItem("userProfile",   JSON.stringify(mergedBasic));
       localStorage.setItem("farmerProfile", JSON.stringify(mergedFarm));
    };

    document.addEventListener("keydown", onKey);
    window.addEventListener("AGRIBOT_UPDATE_PROFILE", handleProfileUpdate);
    
    return () => {
       document.removeEventListener("keydown", onKey);
       window.removeEventListener("AGRIBOT_UPDATE_PROFILE", handleProfileUpdate);
    };
  }, [isOpen, onClose, shared, basic, farm, selectedCrops]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const upShared = (key, val) => setShared(p => ({ ...p, [key]: val }));
  const upBasic  = (key, val) => setBasic(p  => ({ ...p, [key]: val }));
  const upFarm   = (key, val) => setFarm(p   => ({ ...p, [key]: val }));
  const toggleCrop = (crop) =>
    setSelectedCrops(p => p.includes(crop) ? p.filter(c => c !== crop) : [...p, crop]);

  const handleSave = () => {
    const mergedBasic = { ...shared, ...basic };
    const mergedFarm  = { ...shared, ...farm, primaryCrops: selectedCrops };
    localStorage.setItem("userProfile",   JSON.stringify(mergedBasic));
    localStorage.setItem("farmerProfile", JSON.stringify(mergedFarm));
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

  const stats = [
    { label: "Transactions", value: 18 },
    { label: "Revenue",      value: "₹284K" },
    { label: "Member Since", value: "June 2024" },
    { label: "Season",       value: "Rabi 2025-26" },
  ];

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
            {[{ id: "settings", label: "Basic Info" }, { id: "identity", label: "Farm Identity" }].map(tab => (
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
                    {profileImage ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-12 h-12 text-emerald-600" />}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-emerald-600 text-white p-2 rounded-full cursor-pointer hover:bg-emerald-700 transition-colors">
                      <Camera className="w-4 h-4" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{shared.name}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Shared fields */}
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
                  <label className="text-sm font-medium text-gray-700">Farm Size</label>
                  <input value={basic.farmSize} onChange={e => upBasic("farmSize", e.target.value)} disabled={!isEditing} className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Primary Crops</label>
                  <input value={basic.crops} onChange={e => upBasic("crops", e.target.value)} disabled={!isEditing} className={inputCls} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Bio</label>
                <textarea name="bio" value={basic.bio} onChange={e => upBasic("bio", e.target.value)} disabled={!isEditing} rows={3} className={`${inputCls} resize-none`} placeholder="Tell about your farming experience..." />
              </div>
            </>
          )}

          {/* ══ Farm Identity ══ */}
          {activeTab === "identity" && (
            <>
              {/* Banner — uses shared name/location */}
              <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-green-800 text-white rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center overflow-hidden text-2xl">
                        {profileImage ? <img src={profileImage} alt="avatar" className="w-full h-full object-cover" /> : "👨‍🌾"}
                      </div>
                      {isEditing && (
                        <label className="absolute -bottom-1 -right-1 bg-white text-emerald-700 p-1 rounded-full cursor-pointer hover:bg-emerald-50 shadow">
                          <Camera className="w-3 h-3" />
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{shared.name}</h3>
                      <p className="text-emerald-200 text-sm">{farm.village}, {farm.district}, {farm.state}</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge className="bg-white/20 text-white border-0 text-xs">Verified Farmer</Badge>
                        <Badge className="bg-white/20 text-white border-0 text-xs">Aadhaar ****{farm.aadhaarLast4}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {stats.map((s, i) => (
                      <div key={i} className="bg-white/10 rounded-xl px-3 py-2 text-center">
                        <div className="text-base font-bold">{s.value}</div>
                        <div className="text-emerald-200 text-[10px] uppercase font-semibold tracking-wider">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-5">
                {/* Personal Info — name & phone synced */}
                <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
                  <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2"><User className="w-4 h-4 text-emerald-600" />Personal Information</h4>

                  <div><label className={labelCls}>Full Name</label>
                    <input value={shared.name} onChange={e => upShared("name", e.target.value)} disabled={!isEditing} className={inputCls} /></div>
                  <div><label className={labelCls}>Phone Number</label>
                    <input value={shared.phone} onChange={e => upShared("phone", e.target.value)} disabled={!isEditing} className={inputCls} /></div>

                  {[
                    { label: "Village",          key: "village" },
                    { label: "District",         key: "district" },
                    { label: "State",            key: "state" },
                    { label: "Aadhaar (Last 4)", key: "aadhaarLast4" },
                  ].map(({ label, key }) => (
                    <div key={key}><label className={labelCls}>{label}</label>
                      <input value={farm[key] || ""} onChange={e => upFarm(key, e.target.value)} disabled={!isEditing} className={inputCls} /></div>
                  ))}
                </div>

                {/* Farm Details */}
                <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
                  <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2"><Wheat className="w-4 h-4 text-emerald-600" />Farm Details</h4>
                  <div><label className={labelCls}>Land Size (Acres)</label>
                    <input type="number" value={farm.landSizeAcres || ""} onChange={e => upFarm("landSizeAcres", Number(e.target.value))} disabled={!isEditing} className={inputCls} /></div>
                  <div><label className={labelCls}>Soil Type</label>
                    <select value={farm.soilType} onChange={e => upFarm("soilType", e.target.value)} disabled={!isEditing} className={inputCls}>
                      {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                  <div><label className={labelCls}>Irrigation Type</label>
                    <select value={farm.irrigationType} onChange={e => upFarm("irrigationType", e.target.value)} disabled={!isEditing} className={inputCls}>
                      {IRRIGATION_TYPES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                  <div><label className={labelCls}>Primary Crops</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {CROP_OPTIONS.map(crop => (
                        <button key={crop} onClick={() => isEditing && toggleCrop(crop)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedCrops.includes(crop) ? "bg-emerald-600 text-white shadow" : isEditing ? "bg-white border border-gray-300 text-gray-600 hover:border-emerald-400 cursor-pointer" : "bg-gray-100 text-gray-400"}`}>
                          {crop}</button>
                      ))}
                    </div>
                  </div>
                  <div><label className={labelCls}>UPI ID</label>
                    <input value={farm.upiId || ""} onChange={e => upFarm("upiId", e.target.value)} disabled={!isEditing} className={inputCls} /></div>
                </div>
              </div>

              {/* Crop History */}
              <div className="bg-gray-50 rounded-2xl p-5">
                <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-4"><ChevronRight className="w-4 h-4 text-emerald-600" />Crop History</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b text-left text-gray-500">{["Season","Crop","Yield","Sold To","Revenue","Rating"].map(h => <th key={h} className="pb-2 font-medium pr-4 whitespace-nowrap">{h}</th>)}</tr></thead>
                    <tbody className="text-gray-700">
                      {CROP_HISTORY.map((row, i) => (
                        <tr key={i} className="border-b last:border-0 hover:bg-emerald-50/50 transition-colors">
                          <td className="py-2 pr-4 font-medium whitespace-nowrap">{row.season}</td>
                          <td className="py-2 pr-4">{row.crop}</td><td className="py-2 pr-4">{row.yield}</td>
                          <td className="py-2 pr-4">{row.soldTo}</td>
                          <td className="py-2 pr-4 font-semibold text-emerald-700">{row.revenue}</td>
                          <td className="py-2"><Badge variant="outline" className="text-amber-600 border-amber-200">⭐ {row.rating}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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

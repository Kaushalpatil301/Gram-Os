import { useState } from "react";
import {
  User, Phone, MapPin, Wheat, Store, ShoppingBag, Briefcase,
  ChevronRight, CheckCircle, Loader2, Building2, CreditCard,
  Leaf, Droplets, Tag, Crosshair
} from "lucide-react";
import { apiFetch } from "../../lib/api.js";
import { getUserLocation } from "../../lib/locationService.js";

// ─── Role-specific configs ────────────────────────────────────────────────────
const ROLE_CONFIG = {
  farmer: {
    emoji: "👨‍🌾",
    title: "Farmer Profile Setup",
    subtitle: "Tell us about your farm so we can connect you with the right buyers.",
    color: "emerald",
    gradient: "from-emerald-600 to-green-700",
    steps: ["Personal Info", "Farm Details", "Crops"],
  },
  retailer: {
    emoji: "🏪",
    title: "Retailer Profile Setup",
    subtitle: "Set up your store profile to source quality produce directly.",
    color: "blue",
    gradient: "from-blue-600 to-indigo-700",
    steps: ["Personal Info", "Business Details"],
  },
  consumer: {
    emoji: "🛒",
    title: "Consumer Profile Setup",
    subtitle: "Personalise your experience for fresh, traceable produce.",
    color: "rose",
    gradient: "from-rose-500 to-pink-600",
    steps: ["Personal Info", "Preferences"],
  },
  villager: {
    emoji: "🏡",
    title: "Villager Profile Setup",
    subtitle: "Set up your gig profile to get matched with harvest jobs.",
    color: "amber",
    gradient: "from-amber-500 to-orange-600",
    steps: ["Personal Info", "Skills & Work"],
  },
};

const SOIL_TYPES = ["Black Cotton", "Red Soil", "Alluvial", "Laterite", "Sandy", "Clay", "Loamy"];
const IRRIGATION  = ["Drip", "Sprinkler", "Canal", "Well", "Rainfed", "Borewell"];
const CROPS       = ["Tomato", "Onion", "Wheat", "Rice", "Sugarcane", "Cotton", "Soybean", "Banana", "Mango", "Potato", "Chilli", "Maize"];
const SKILLS      = ["Harvesting", "Pesticide Use", "Irrigation Setup", "Drip Line", "Sorting & Grading", "Transplanting", "Land Preparation", "Spraying"];
const LANGUAGES   = ["Marathi", "Hindi", "English", "Kannada", "Telugu", "Tamil", "Bengali"];
const PREFS       = ["Organic", "Local Farm", "Low Pesticide", "Exotic Vegetables", "Dairy", "Dry Fruits", "Pulses", "Spices"];
const BIZ_TYPES   = ["Grocery Store", "Supermarket", "Wholesaler", "Restaurant", "Hotel", "Online Reseller", "Other"];

// ─── Field components ─────────────────────────────────────────────────────────
const Input = ({ icon: Icon, label, type = "text", value, onChange, placeholder }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
      {Icon && <Icon className="w-3.5 h-3.5 text-gray-400" />} {label}
    </label>
    <input
      type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
    />
  </div>
);

const Select = ({ icon: Icon, label, value, onChange, options }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
      {Icon && <Icon className="w-3.5 h-3.5 text-gray-400" />} {label}
    </label>
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white">
      <option value="">Select…</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const Chips = ({ label, options, selected, onToggle, color = "emerald" }) => (
  <div className="space-y-2">
    <label className="text-sm font-semibold text-gray-700">{label}</label>
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button key={opt} type="button" onClick={() => onToggle(opt)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
            ${selected.includes(opt)
              ? `bg-${color}-600 text-white border-${color}-600 shadow-sm`
              : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}>
          {opt}
        </button>
      ))}
    </div>
  </div>
);

// ─── Step content per role ────────────────────────────────────────────────────
function FarmerStep({ step, data, set }) {
  const tog = (field, val) =>
    set(p => ({ ...p, [field]: p[field]?.includes(val) ? p[field].filter(x => x !== val) : [...(p[field] || []), val] }));

  if (step === 0) return (
    <div className="grid grid-cols-1 gap-4">
      <Input icon={User}   label="Full Name"    value={data.name}     onChange={v => set(p => ({ ...p, name: v }))}     placeholder="Your full name" />
      <Input icon={Phone}  label="Phone Number" value={data.phone}    onChange={v => set(p => ({ ...p, phone: v }))}    placeholder="+91 98765 43210" type="tel" />
      <div className="flex gap-2">
        <Input icon={MapPin} label="Village"      value={data.village}  onChange={v => set(p => ({ ...p, village: v }))}  placeholder="e.g. Koregaon" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input icon={MapPin} label="District" value={data.district} onChange={v => set(p => ({ ...p, district: v }))} placeholder="e.g. Pune" />
        <Input icon={MapPin} label="State"    value={data.state}    onChange={v => set(p => ({ ...p, state: v }))}    placeholder="e.g. Maharashtra" />
      </div>
    </div>
  );
  if (step === 1) return (
    <div className="grid grid-cols-1 gap-4">
      <Input icon={Leaf}     label="Land Size (Acres)" value={data.landSizeAcres} onChange={v => set(p => ({ ...p, landSizeAcres: v }))} placeholder="e.g. 5" type="number" />
      <Select icon={Droplets} label="Soil Type"       value={data.soilType}      onChange={v => set(p => ({ ...p, soilType: v }))}      options={SOIL_TYPES} />
      <Select icon={Droplets} label="Irrigation Type" value={data.irrigationType} onChange={v => set(p => ({ ...p, irrigationType: v }))} options={IRRIGATION} />
      <Input icon={Tag}      label="UPI ID"           value={data.upiId}         onChange={v => set(p => ({ ...p, upiId: v }))}         placeholder="yourname@upi" />
    </div>
  );
  if (step === 2) return (
    <div className="space-y-4">
      <Chips label="Primary Crops (select all that apply)" options={CROPS} selected={data.primaryCrops || []} onToggle={v => tog("primaryCrops", v)} color="emerald" />
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-gray-700">Bio (optional)</label>
        <textarea value={data.bio} onChange={e => set(p => ({ ...p, bio: e.target.value }))} rows={3}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none transition-all bg-gray-50 focus:bg-white resize-none"
          placeholder="Tell buyers about your farming experience…" />
      </div>
    </div>
  );
}

function RetailerStep({ step, data, set }) {
  if (step === 0) return (
    <div className="grid grid-cols-1 gap-4">
      <Input icon={User}   label="Full Name"    value={data.name}     onChange={v => set(p => ({ ...p, name: v }))}     placeholder="Your full name" />
      <Input icon={Phone}  label="Phone Number" value={data.phone}    onChange={v => set(p => ({ ...p, phone: v }))}    placeholder="+91 98765 43210" type="tel" />
      <Input icon={MapPin} label="City / Area"  value={data.location} onChange={v => set(p => ({ ...p, location: v }))} placeholder="e.g. Mumbai, Maharashtra" />
    </div>
  );
  if (step === 1) return (
    <div className="grid grid-cols-1 gap-4">
      <Input icon={Store}    label="Store Name"        value={data.storeName}    onChange={v => set(p => ({ ...p, storeName: v }))}    placeholder="e.g. Fresh Mart" />
      <Select icon={Building2} label="Business Type"   value={data.businessType} onChange={v => set(p => ({ ...p, businessType: v }))} options={BIZ_TYPES} />
      <Input icon={MapPin}   label="Store Address"     value={data.storeAddress} onChange={v => set(p => ({ ...p, storeAddress: v }))} placeholder="Full store address" />
      <div className="grid grid-cols-2 gap-3">
        <Input icon={CreditCard} label="GST Number" value={data.gstNumber} onChange={v => set(p => ({ ...p, gstNumber: v }))} placeholder="27ABCDE1234F1Z5" />
        <Input icon={CreditCard} label="PAN Number" value={data.panNumber} onChange={v => set(p => ({ ...p, panNumber: v }))} placeholder="ABCDE1234F" />
      </div>
      <Input label="Years in Business" value={data.yearsInBusiness} onChange={v => set(p => ({ ...p, yearsInBusiness: v }))} placeholder="e.g. 8 years" />
    </div>
  );
}

function ConsumerStep({ step, data, set }) {
  const tog = val => set(p => ({
    ...p, preferences: p.preferences?.includes(val) ? p.preferences.filter(x => x !== val) : [...(p.preferences || []), val]
  }));
  if (step === 0) return (
    <div className="grid grid-cols-1 gap-4">
      <Input icon={User}   label="Full Name"       value={data.name}            onChange={v => set(p => ({ ...p, name: v }))}            placeholder="Your full name" />
      <Input icon={Phone}  label="Phone Number"    value={data.phone}           onChange={v => set(p => ({ ...p, phone: v }))}           placeholder="+91 98765 43210" type="tel" />
      <Input icon={MapPin} label="Location"        value={data.location}        onChange={v => set(p => ({ ...p, location: v }))}        placeholder="e.g. Pune, Maharashtra" />
      <Input icon={MapPin} label="Delivery Address" value={data.deliveryAddress} onChange={v => set(p => ({ ...p, deliveryAddress: v }))} placeholder="Your delivery address" />
    </div>
  );
  if (step === 1) return (
    <div className="space-y-4">
      <Chips label="Food Preferences (select all that apply)" options={PREFS} selected={data.preferences || []} onToggle={tog} color="rose" />
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-gray-700">Anything else? (optional)</label>
        <textarea value={data.bio} onChange={e => set(p => ({ ...p, bio: e.target.value }))} rows={3}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-400 outline-none transition-all bg-gray-50 focus:bg-white resize-none"
          placeholder="Tell us your preferences or dietary requirements…" />
      </div>
    </div>
  );
}

function VillagerStep({ step, data, set }) {
  const tog = val => set(p => ({
    ...p, skills: p.skills?.includes(val) ? p.skills.filter(x => x !== val) : [...(p.skills || []), val]
  }));
  if (step === 0) return (
    <div className="grid grid-cols-1 gap-4">
      <Input icon={User}   label="Full Name"    value={data.name}     onChange={v => set(p => ({ ...p, name: v }))}     placeholder="Your full name" />
      <Input icon={Phone}  label="Phone Number" value={data.phone}    onChange={v => set(p => ({ ...p, phone: v }))}    placeholder="+91 98765 43210" type="tel" />
      <Input icon={MapPin} label="Village / Area" value={data.location} onChange={v => set(p => ({ ...p, location: v }))} placeholder="e.g. Satara, Maharashtra" />
      <Select label="Preferred Language" value={data.language} onChange={v => set(p => ({ ...p, language: v }))} options={LANGUAGES} />
    </div>
  );
  if (step === 1) return (
    <div className="space-y-4">
      <Chips label="Your Skills (select all that apply)" options={SKILLS} selected={data.skills || []} onToggle={tog} color="amber" />
      <Input icon={Briefcase} label="Specialization" value={data.specialization} onChange={v => set(p => ({ ...p, specialization: v }))} placeholder="e.g. Harvest & Irrigation" />
      <Input label="Years of Experience" value={data.experience} onChange={v => set(p => ({ ...p, experience: v }))} placeholder="e.g. 5 years" />
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-gray-700">Bio (optional)</label>
        <textarea value={data.bio} onChange={e => set(p => ({ ...p, bio: e.target.value }))} rows={2}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 outline-none transition-all bg-gray-50 focus:bg-white resize-none"
          placeholder="Tell farmers about your experience…" />
      </div>
    </div>
  );
}

// ─── Main Wizard Component ────────────────────────────────────────────────────
export default function ProfileSetupWizard({ user, onComplete }) {
  const role   = user?.role || "consumer";
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.consumer;

  const [step,   setStep]   = useState(0);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  // Seed initial form data from the User doc received from signup
  const [data, setData] = useState({
    name:     user?.username || user?.name || "",
    email:    user?.email    || "",
    phone:    "",
    location: "",
    // farmer-specific
    village: "", district: "", state: "",
    landSizeAcres: "", soilType: "Black Cotton", irrigationType: "Drip",
    primaryCrops: [], upiId: "", bio: "",
    // retailer-specific
    storeName: "", storeAddress: "", businessType: "", gstNumber: "", panNumber: "", yearsInBusiness: "",
    // consumer-specific
    deliveryAddress: "", preferences: [],
    // villager-specific
    language: "Marathi", skills: [], specialization: "", experience: "",
  });

  const [locationLoading, setLocationLoading] = useState(false);

  // Auto-fetch location when wizard opens
  const fetchLocation = async () => {
    setLocationLoading(true);
    try {
      const loc = await getUserLocation();
      if (loc && loc.address) {
        // Parse the address roughly to populate village/district/state if possible
        const parts = loc.address.split(",").map(s => s.trim());
        const stateStr = parts.length >= 2 ? parts[parts.length - 2] : ""; // roughly second to last
        const distStr = parts.length >= 3 ? parts[parts.length - 3] : "";

        setData(prev => ({
          ...prev,
          location: prev.location || loc.address,
          deliveryAddress: prev.deliveryAddress || loc.address,
          storeAddress: prev.storeAddress || loc.address,
          village: prev.village || (parts.length > 3 ? parts[0] : ""),
          district: prev.district || distStr,
          state: prev.state || stateStr,
        }));
      }
    } catch (e) {
      console.warn("Could not auto-fetch location", e);
    } finally {
      setLocationLoading(false);
    }
  };

  const totalSteps = config.steps.length;
  const isLastStep = step === totalSteps - 1;

  const handleNext = () => setStep(s => Math.min(s + 1, totalSteps - 1));
  const handleBack = () => setStep(s => Math.max(s - 1, 0));

  const handleFinish = async () => {
    setSaving(true);
    setError("");
    try {
      // Clean payload: send only role-specific fields to avoid Mongoose strict/cast errors
      let payload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        location: data.location,
        bio: data.bio
      };

      if (role === "farmer") {
        payload = { ...payload, village: data.village, district: data.district, state: data.state, 
                    landSizeAcres: data.landSizeAcres ? Number(data.landSizeAcres) : 0, 
                    soilType: data.soilType, irrigationType: data.irrigationType, primaryCrops: data.primaryCrops, upiId: data.upiId };
      } else if (role === "retailer") {
        payload = { ...payload, storeName: data.storeName, storeAddress: data.storeAddress, businessType: data.businessType,
                    gstNumber: data.gstNumber, panNumber: data.panNumber, yearsInBusiness: data.yearsInBusiness, specialization: data.specialization };
      } else if (role === "villager") {
        payload = { ...payload, language: data.language, skills: data.skills, specialization: data.specialization, experience: data.experience };
      } else {
        payload = { ...payload, deliveryAddress: data.deliveryAddress, preferences: data.preferences };
      }

      await apiFetch("/profile/me", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      onComplete(user);   // parent will redirect to dashboard
    } catch (err) {
      // If API fails, show error instead of silently skipping
      console.warn("[ProfileSetupWizard] save failed:", err.message);
      setError(err.message || "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const renderStepContent = () => {
    if (role === "farmer")   return <FarmerStep   step={step} data={data} set={setData} />;
    if (role === "retailer") return <RetailerStep  step={step} data={data} set={setData} />;
    if (role === "consumer") return <ConsumerStep  step={step} data={data} set={setData} />;
    if (role === "villager") return <VillagerStep  step={step} data={data} set={setData} />;
    return null;
  };

  const colorMap = {
    emerald: { btn: "bg-emerald-600 hover:bg-emerald-700", ring: "bg-emerald-600", text: "text-emerald-600", border: "border-emerald-500" },
    blue:    { btn: "bg-blue-600 hover:bg-blue-700",       ring: "bg-blue-600",    text: "text-blue-600",    border: "border-blue-500" },
    rose:    { btn: "bg-rose-500 hover:bg-rose-600",       ring: "bg-rose-500",    text: "text-rose-500",    border: "border-rose-500" },
    amber:   { btn: "bg-amber-500 hover:bg-amber-600",     ring: "bg-amber-500",   text: "text-amber-500",   border: "border-amber-500" },
  };
  const cl = colorMap[config.color];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[95vh]">

        {/* Header */}
        <div className={`bg-gradient-to-r ${config.gradient} text-white px-8 py-6`}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{config.emoji}</span>
            <div>
              <h2 className="text-xl font-bold">{config.title}</h2>
              <p className="text-sm text-white/80">{config.subtitle}</p>
            </div>
          </div>

          {/* Step dots */}
          <div className="flex items-center gap-2 mt-4">
            {config.steps.map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all
                  ${i < step ? "bg-white/30 text-white" : i === step ? "bg-white text-gray-800" : "bg-white/20 text-white/60"}`}>
                  {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs font-medium ${i === step ? "text-white" : "text-white/60"}`}>{label}</span>
                {i < config.steps.length - 1 && (
                  <div className={`h-px w-6 ${i < step ? "bg-white/60" : "bg-white/20"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${((step + 1) / totalSteps) * 100}%` }} />
          </div>
        </div>

        {/* Step label & location button */}
        <div className="px-8 pt-5 pb-1 flex justify-between items-center">
          <h3 className={`text-base font-bold ${cl.text}`}>
            Step {step + 1} of {totalSteps} — {config.steps[step]}
          </h3>
          {step === 0 && (
            <button 
              onClick={fetchLocation} 
              disabled={locationLoading}
              className={`text-xs font-medium flex items-center gap-1 hover:underline transition-colors ${cl.text} disabled:opacity-50`}
            >
              {locationLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Crosshair className="w-3 h-3" />}
              Auto-detect Location
            </button>
          )}
        </div>

        {/* Scrollable form body */}
        <div className="overflow-y-auto flex-1 px-8 pb-4 pt-3">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
          )}
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0">
          <button onClick={handleBack} disabled={step === 0}
            className="px-5 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-30 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all">
            ← Back
          </button>

          <div className="flex items-center gap-2">
            <button onClick={isLastStep ? handleFinish : handleNext}
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-xl shadow-md transition-all ${cl.btn} disabled:opacity-60`}>
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                : isLastStep
                  ? <><CheckCircle className="w-4 h-4" /> Complete Setup</>
                  : <>Next Step <ChevronRight className="w-4 h-4" /></>}
            </button>

            {!isLastStep && (
              <button onClick={() => onComplete(user)}
                className="text-xs text-gray-400 hover:text-gray-600 px-3 py-2.5 transition-colors">
                Skip for now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

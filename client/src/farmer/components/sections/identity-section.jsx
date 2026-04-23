import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User, MapPin, Landmark, Droplets, Wheat, Save, Edit2, Shield, ChevronRight } from "lucide-react";

const SOIL_TYPES = ["Black Cotton", "Red Soil", "Alluvial", "Laterite", "Sandy", "Clay", "Loamy"];
const IRRIGATION_TYPES = ["Drip", "Sprinkler", "Canal", "Well", "Rainfed", "Borewell"];
const CROP_OPTIONS = ["Tomato", "Onion", "Wheat", "Rice", "Sugarcane", "Cotton", "Soybean", "Banana", "Mango", "Potato", "Chilli", "Maize"];

export default function IdentitySection() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const storedProfile = JSON.parse(localStorage.getItem("farmerProfile") || "null");

  const [isEditing, setIsEditing] = useState(!storedProfile);
  const [profile, setProfile] = useState(storedProfile || {
    name: user.name || "Rajesh Sharma", phone: user.phone || "+91 98765 43210",
    village: "Koregaon", district: "Pune", state: "Maharashtra", aadhaarLast4: "4521",
    landSizeAcres: 5, soilType: "Black Cotton", irrigationType: "Drip",
    primaryCrops: ["Tomato", "Onion", "Wheat"], upiId: "rajesh@upi", accountLinked: true,
  });
  const [selectedCrops, setSelectedCrops] = useState(profile.primaryCrops || []);

  const handleSave = () => {
    const updated = { ...profile, primaryCrops: selectedCrops };
    localStorage.setItem("farmerProfile", JSON.stringify(updated));
    setProfile(updated);
    setIsEditing(false);
  };

  const toggleCrop = (crop) => setSelectedCrops(prev => prev.includes(crop) ? prev.filter(c => c !== crop) : [...prev, crop]);
  const update = (key, value) => setProfile(prev => ({ ...prev, [key]: value }));

  const stats = { totalTransactions: 18, totalRevenue: 284000, memberSince: "June 2024", activeSeason: "Rabi 2025-26" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <div className="p-2 bg-emerald-100 rounded-xl"><Shield className="w-5 h-5 text-emerald-700" /></div>
            Digital Farm Identity
          </h2>
          <p className="text-gray-500 mt-1">Your verified economic passport — every feature feeds from this identity.</p>
        </div>
        <Button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer">
          {isEditing ? <><Save className="w-4 h-4 mr-2" /> Save Profile</> : <><Edit2 className="w-4 h-4 mr-2" /> Edit Profile</>}
        </Button>
      </div>

      {/* Identity Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-green-800 text-white rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl">👨‍🌾</div>
            <div>
              <h3 className="text-2xl font-bold">{profile.name}</h3>
              <p className="text-emerald-200 text-sm">{profile.village}, {profile.district}, {profile.state}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-white/20 text-white border-0 text-xs">Verified Farmer</Badge>
                <Badge className="bg-white/20 text-white border-0 text-xs">Aadhaar ****{profile.aadhaarLast4}</Badge>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Transactions", value: stats.totalTransactions },
              { label: "Revenue", value: `₹${(stats.totalRevenue / 1000).toFixed(0)}K` },
              { label: "Member Since", value: stats.memberSince },
              { label: "Season", value: stats.activeSeason },
            ].map((s, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 text-center">
                <div className="text-lg font-bold">{s.value}</div>
                <div className="text-emerald-200 text-[10px] uppercase font-semibold tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2"><User className="w-4 h-4 text-emerald-600" /> Personal Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Full Name", key: "name" }, { label: "Phone Number", key: "phone" },
              { label: "Village", key: "village" }, { label: "District", key: "district" },
              { label: "State", key: "state" }, { label: "Aadhaar (Last 4)", key: "aadhaarLast4" },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</label>
                <Input value={profile[key] || ""} onChange={(e) => update(key, e.target.value)} disabled={!isEditing} className="mt-1 disabled:bg-gray-50 disabled:border-0 disabled:text-gray-900 disabled:font-medium" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2"><Wheat className="w-4 h-4 text-emerald-600" /> Farm Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Land Size (Acres)</label>
              <Input type="number" value={profile.landSizeAcres || ""} onChange={(e) => update("landSizeAcres", Number(e.target.value))} disabled={!isEditing} className="mt-1 disabled:bg-gray-50 disabled:border-0 disabled:text-gray-900 disabled:font-medium" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Soil Type</label>
              <select value={profile.soilType} onChange={(e) => update("soilType", e.target.value)} disabled={!isEditing} className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm disabled:bg-gray-50 disabled:border-0 disabled:text-gray-900 disabled:font-medium">
                {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Irrigation Type</label>
              <select value={profile.irrigationType} onChange={(e) => update("irrigationType", e.target.value)} disabled={!isEditing} className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm disabled:bg-gray-50 disabled:border-0 disabled:text-gray-900 disabled:font-medium">
                {IRRIGATION_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Primary Crops</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {CROP_OPTIONS.map(crop => (
                  <button key={crop} onClick={() => isEditing && toggleCrop(crop)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedCrops.includes(crop) ? "bg-emerald-600 text-white shadow-md" : isEditing ? "bg-gray-100 text-gray-600 hover:bg-emerald-50 cursor-pointer" : "bg-gray-50 text-gray-400"}`}>
                    {crop}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">UPI ID</label>
              <Input value={profile.upiId || ""} onChange={(e) => update("upiId", e.target.value)} disabled={!isEditing} className="mt-1 disabled:bg-gray-50 disabled:border-0 disabled:text-gray-900 disabled:font-medium" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Crop History */}
      <Card className="border-0 shadow-md">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><ChevronRight className="w-4 h-4 text-emerald-600" /> Crop History</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-gray-500"><th className="pb-3 font-medium">Season</th><th className="pb-3 font-medium">Crop</th><th className="pb-3 font-medium">Yield</th><th className="pb-3 font-medium">Sold To</th><th className="pb-3 font-medium">Revenue</th><th className="pb-3 font-medium">Rating</th></tr></thead>
              <tbody className="text-gray-700">
                {[
                  { season: "Kharif 2025", crop: "Tomato", yield: "32 qtl", soldTo: "APMC Pune", revenue: "₹96,000", rating: 4.5 },
                  { season: "Rabi 2024-25", crop: "Wheat", yield: "45 qtl", soldTo: "ITC e-Choupal", revenue: "₹1,12,500", rating: 4.2 },
                  { season: "Kharif 2024", crop: "Onion", yield: "28 qtl", soldTo: "APMC Nashik", revenue: "₹56,000", rating: 3.8 },
                  { season: "Rabi 2023-24", crop: "Sugarcane", yield: "120 qtl", soldTo: "Vasantdada Coop", revenue: "₹3,60,000", rating: 4.7 },
                ].map((row, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-emerald-50/50 transition-colors">
                    <td className="py-3 font-medium">{row.season}</td><td className="py-3">{row.crop}</td><td className="py-3">{row.yield}</td>
                    <td className="py-3">{row.soldTo}</td><td className="py-3 font-semibold text-emerald-700">{row.revenue}</td>
                    <td className="py-3"><Badge variant="outline" className="text-amber-600 border-amber-200">⭐ {row.rating}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

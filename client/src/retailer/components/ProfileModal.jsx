import { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  Store,
  Package,
  CreditCard,
  Loader2,
  CheckCircle,
  AlertCircle,
  Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProfile } from "../../contexts/useProfile.js";
import { useTranslation } from "../../consumer/i18n/config.jsx";

function loadLS(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}

const DEFAULTS = {
  name: "",
  email: "",
  phone: "",
  location: "",
  storeName: "",
  storeAddress: "",
  businessType: "",
  gstNumber: "",
  panNumber: "",
  yearsInBusiness: "",
  specialization: "",
  bio: "",
};

export default function RetailerProfileModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const {
    profile: dbProfile,
    user: dbUser,
    loading,
    saving,
    saveProfile,
  } = useProfile();

  const savedLS = loadLS("retailerProfile", null);
  const userRaw = dbUser || loadLS("user", {});

  // Merge priority: User doc (email/name) > DB profile > localStorage > blank
  const buildForm = (db, ls, raw) => ({
    name: raw?.username || db?.name || ls?.name || raw?.name || "",
    email: raw?.email || db?.email || ls?.email || "",
    phone: db?.phone || ls?.phone || raw?.phone || "",
    location: db?.location || ls?.location || raw?.location?.address || "",
    storeName: db?.storeName || ls?.storeName || "",
    storeAddress: db?.storeAddress || ls?.storeAddress || "",
    businessType: db?.businessType || ls?.businessType || "",
    gstNumber: db?.gstNumber || ls?.gstNumber || "",
    panNumber: db?.panNumber || ls?.panNumber || "",
    yearsInBusiness: db?.yearsInBusiness || ls?.yearsInBusiness || "",
    specialization: db?.specialization || ls?.specialization || "",
    bio: db?.bio || ls?.bio || "",
  });

  const [formData, setFormData] = useState(() =>
    buildForm(null, savedLS, userRaw),
  );
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);

  // Sync from DB when it loads
  useEffect(() => {
    if (!loading) {
      setFormData(buildForm(dbProfile, savedLS, userRaw));
    }
  }, [loading, dbProfile, dbUser]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    localStorage.setItem("retailerProfile", JSON.stringify(formData));
    setSaveStatus(null);
    try {
      await saveProfile(formData);
      setSaveStatus("success");
    } catch {
      setSaveStatus("error");
    }
    setIsEditing(false);
    setTimeout(() => setSaveStatus(null), 3000);
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

  const inputCls =
    "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600 text-sm";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Store className="w-6 h-6" />
              <h2 className="text-2xl font-bold">{t("profile.title")}</h2>
              {loading && (
                <Loader2 className="w-4 h-4 animate-spin opacity-70" />
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Save status */}
        {saveStatus && (
          <div
            className={`px-6 py-2 text-sm font-medium flex items-center gap-2 ${saveStatus === "success" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
          >
            {saveStatus === "success" ? (
              <>
                <CheckCircle className="w-4 h-4" /> {t("profile.savedSuccess")}
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4" /> {t("profile.savedFallback")}
              </>
            )}
          </div>
        )}

        <div className="p-6 space-y-8">
          {/* Profile Picture */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center overflow-hidden">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-green-600" />
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full cursor-pointer hover:bg-green-700 transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900">
                {formData.name}
              </h3>
              <p className="text-sm text-gray-600">{formData.storeName}</p>
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              {t("profile.personal")}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  label: t("profile.fullName"),
                  name: "name",
                  icon: <User className="w-4 h-4" />,
                  type: "text",
                },
                {
                  label: t("profile.email"),
                  name: "email",
                  icon: <Mail className="w-4 h-4" />,
                  type: "email",
                },
                {
                  label: t("profile.phone"),
                  name: "phone",
                  icon: <Phone className="w-4 h-4" />,
                  type: "tel",
                },
                {
                  label: t("profile.location"),
                  name: "location",
                  icon: <MapPin className="w-4 h-4" />,
                  type: "text",
                },
              ].map(({ label, name, icon, type }) => (
                <div key={name} className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    {icon}
                    {label}
                  </label>
                  <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={inputCls}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Business Information */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              {t("profile.business")}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  {t("profile.storeName")}
                </label>
                <input
                  type="text"
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={inputCls}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  {t("profile.businessType")}
                </label>
                <input
                  type="text"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={inputCls}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {t("profile.storeAddress")}
                </label>
                <input
                  type="text"
                  name="storeAddress"
                  value={formData.storeAddress}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={inputCls}
                />
              </div>
              {[
                {
                  label: t("profile.gst"),
                  name: "gstNumber",
                  icon: <CreditCard className="w-4 h-4" />,
                },
                {
                  label: t("profile.pan"),
                  name: "panNumber",
                  icon: <CreditCard className="w-4 h-4" />,
                },
                {
                  label: t("profile.years"),
                  name: "yearsInBusiness",
                  icon: null,
                },
                {
                  label: t("profile.specialization"),
                  name: "specialization",
                  icon: null,
                },
              ].map(({ label, name, icon }) => (
                <div key={name} className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    {icon}
                    {label}
                  </label>
                  <input
                    type="text"
                    name={name}
                    value={formData[name]}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={inputCls}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t("profile.bio")}
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              disabled={!isEditing}
              rows={4}
              className={`${inputCls} resize-none`}
              placeholder={t("profile.bioPlaceholder")}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200">
          <div className="flex justify-between items-center">
            {isEditing ? (
              <div className="flex gap-3">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? t("common.save") : t("profile.saveChanges")}
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  {t("common.cancel")}
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" /> {t("profile.editProfile")}
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              {t("common.close")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

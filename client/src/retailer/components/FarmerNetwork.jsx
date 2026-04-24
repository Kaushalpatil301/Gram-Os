import { useState } from "react";
import { Users, CreditCard } from "lucide-react";
import Farmers from "./Farmers";
import Transactions from "./Transactions";
import { useTranslation } from "../../consumer/i18n/config.jsx";

const tabs = [
  { id: "farmers", labelKey: "network.tab.farmers", icon: Users },
  { id: "history", labelKey: "network.tab.history", icon: CreditCard },
];

export default function FarmerNetwork() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("farmers");

  return (
    <section
      id="network"
      className="bg-white rounded-3xl shadow-xl overflow-hidden mb-12 border border-green-100"
      style={{ scrollMarginTop: "30px" }}
    >
      <div className="p-6 md:p-10">
        {/* Section Header */}
        <div className="mb-8 md:mb-10 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">
            {t("network.title")}
          </h2>
          <p className="text-sm md:text-base text-gray-600">
            {t("network.subtitle")}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white rounded-xl shadow-sm border border-gray-200 p-1.5 gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t(tab.labelKey)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "farmers" && <Farmers />}
          {activeTab === "history" && <Transactions />}
        </div>
      </div>
    </section>
  );
}

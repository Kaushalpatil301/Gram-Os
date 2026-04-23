import React from "react";
import { useTranslation } from "../i18n/config";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="flex justify-center gap-8 mb-6">
            <button className="hover:text-green-400 transition-colors">
              {t("footer.privacy")}
            </button>
            <button className="hover:text-green-400 transition-colors">
              {t("footer.terms")}
            </button>
            <button className="hover:text-green-400 transition-colors">
              {t("footer.support")}
            </button>
            <button className="hover:text-green-400 transition-colors">
              {t("footer.about")}
            </button>
          </div>
          <p className="text-sm text-gray-400">
            {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}

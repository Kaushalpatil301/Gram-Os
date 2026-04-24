import React, { createContext, useContext, useState, useEffect } from "react";
import translationService from "./translationService";

// Base English translations (source language)
const baseTranslations = {
  "header.title": "AgriChain",
  "header.subtitle": "Supply Chain Transparency",
  "header.scans": "Scans",
  "header.logout": "Logout",
  "header.consumer": "Consumer",
  "header.logoutSuccess": "You have been logged out successfully ✅",
  "scan.title": "QR Code Scanner",
  "scan.subtitle":
    "Verify authenticity and trace your product's complete journey from farm to table",
  "scan.button": "Scan QR Code",
  "scan.history": "Recent Scans",
  "scan.noScans": "No scans yet. Start by scanning your first product!",
  "scan.verified": "Verified",
  "scan.warning": "Warning",
  "info.report": "Report Issue",
  "info.reportSubtitle": "Help maintain supply chain integrity",
  "info.howItWorks": "How It Works",
  "info.features": "Key Features",
  "info.step1": "Scan QR code on product",
  "info.step2": "View supply chain history",
  "info.step3": "Verify authenticity",
  "info.feature1": "Blockchain Verified Products",
  "info.feature2": "Complete Supply Chain Tracking",
  "info.feature3": "Quality Assurance Guarantee",
  "report.title": "Report Issue",
  "report.type": "Issue Type",
  "report.productId": "Product ID (Optional)",
  "report.description": "Description",
  "report.uploadImage": "Upload Image (Optional)",
  "report.submit": "Submit Report",
  "report.cancel": "Cancel",
  "report.success": "Report submitted successfully!",
  "report.selectType": "Select issue type",
  "report.productIdPlaceholder": "Enter product ID if available",
  "report.descriptionPlaceholder": "Please describe the issue in detail...",
  "report.uploadText": "Click to upload image",
  "report.qualityIssues": "Quality Issues",
  "report.authenticityIssues": "Authenticity Concerns",
  "report.packagingIssues": "Packaging Problems",
  "report.supplyChainIssues": "Supply Chain Problem",
  "report.labelingIssues": "Incorrect Labeling",
  "report.contaminationIssues": "Contamination",
  "report.paymentIssues": "Payment Issue",
  "report.fraudIssues": "Suspected Fraud",
  "report.otherIssues": "Other",
  "modal.title": "Choose how you'd like to scan the QR code",
  "modal.camera": "Use Camera",
  "modal.upload": "Upload Image",
  "modal.scanning": "Scanning for QR code...",
  "modal.scannerTitle": "QR Scanner",
  "modal.back": "Back",
  "modal.initializingCamera": "Initializing camera...",
  "modal.noQrFound": "❌ No QR code found in this image.",
  "footer.privacy": "Privacy",
  "footer.terms": "Terms",
  "footer.support": "Support",
  "footer.about": "About",
  "footer.copyright": "© 2025 AgriChain. All rights reserved.",
  "loading.scanningQr": "Scanning QR Code...",
  "common.loading": "Loading...",
  "common.close": "Close",
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.selectLanguage": "Select Language",
  "common.optional": "Optional",
};

// Language Context
const LanguageContext = createContext();

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem("preferred-language") || "en";
  });

  const [translations, setTranslations] = useState({ en: baseTranslations });
  const [isLoading, setIsLoading] = useState(false);

  // Load cached translations on mount
  useEffect(() => {
    const loadCachedTranslations = () => {
      const availableLanguages = ["hi", "mr", "ta", "te", "bn", "gu"];
      const cachedTranslations = { en: baseTranslations };

      availableLanguages.forEach((lang) => {
        const cached = translationService.loadFromCache(lang);
        if (cached) {
          cachedTranslations[lang] = cached;
        }
      });

      setTranslations(cachedTranslations);
    };

    loadCachedTranslations();
  }, []);

  // Auto-translate when language changes
  useEffect(() => {
    const translateLanguage = async () => {
      if (currentLanguage === "en" || translations[currentLanguage]) {
        return; // English or already translated
      }

      setIsLoading(true);

      try {
        // Map language codes for API
        const languageMap = {
          hi: "hi", // Hindi
          mr: "mr", // Marathi
          ta: "ta", // Tamil
          te: "te", // Telugu
          bn: "bn", // Bengali
          gu: "gu", // Gujarati
        };

        const targetLang = languageMap[currentLanguage];
        if (!targetLang) return;

        // Batch translate all texts
        const translatedTexts = await translationService.batchTranslate(
          baseTranslations,
          targetLang,
          "google", // You can change to 'libre'
        );

        // Update state and cache
        setTranslations((prev) => ({
          ...prev,
          [currentLanguage]: translatedTexts,
        }));

        // Save to cache for offline use
        translationService.saveToCache(translatedTexts, currentLanguage);
      } catch (error) {
        console.error("Translation failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    translateLanguage();
  }, [currentLanguage]);

  // Translation function with fallback
  const t = (key) => {
    const langTranslations = translations[currentLanguage];
    return langTranslations?.[key] || baseTranslations[key] || key;
  };

  const changeLanguage = (langCode) => {
    setCurrentLanguage(langCode);
    localStorage.setItem("preferred-language", langCode);
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    isLoading, // Show loading indicator while translating
    availableLanguages: [
      { code: "en", name: "English", flag: "🇺🇸" },
      { code: "hi", name: "हिंदी", flag: "🇮🇳" },
      { code: "mr", name: "मराठी", flag: "🇮🇳" },
      { code: "ta", name: "தமிழ்", flag: "🇮🇳" },
      { code: "te", name: "తెలుగు", flag: "🇮🇳" },
      { code: "bn", name: "বাংলা", flag: "🇧🇩" },
      { code: "gu", name: "ગુજરાતી", flag: "🇮🇳" },
    ],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

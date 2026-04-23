import React, { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useTranslation } from '../i18n/config';

export default function LanguageDropdown() {
  const { currentLanguage, changeLanguage, availableLanguages, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = availableLanguages.find(lang => lang.code === currentLanguage);

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/20 transition-colors text-white"
        >
          <Globe className="h-4 w-4" />
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border py-2 z-50">
            <div className="px-3 py-2 text-xs text-gray-500 font-medium border-b">
              {t("common.selectLanguage")}
            </div>
            {availableLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 transition-colors ${
                  currentLanguage === language.code 
                    ? 'bg-green-50 text-green-700 font-medium' 
                    : 'text-gray-700'
                }`}
              >
                <span className="text-sm">{language.name}</span>
                {currentLanguage === language.code && (
                  <div className="ml-auto w-2 h-2 bg-green-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

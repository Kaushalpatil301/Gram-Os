// i18n/translationService.js - API Translation Service

class TranslationService {
  constructor() {
    this.cache = new Map(); // Cache translations to avoid repeated API calls
    this.baseLanguage = 'en'; // Source language
  }

  // Google Translate API (Free - no API key needed)
  async translateWithGoogle(text, targetLang) {
    const cacheKey = `${text}_${targetLang}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${this.baseLanguage}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
      const data = await response.json();
      const translatedText = data[0][0][0];
      
      this.cache.set(cacheKey, translatedText);
      return translatedText;
    } catch (error) {
      console.error('Google Translate error:', error);
      return text; // Return original text if translation fails
    }
  }

  // LibreTranslate API (Free, open source)
  async translateWithLibre(text, targetLang) {
    const cacheKey = `${text}_${targetLang}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch('https://libretranslate.de/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text,
          source: this.baseLanguage,
          target: targetLang,
          format: 'text'
        })
      });
      
      const data = await response.json();
      const translatedText = data.translatedText;
      
      this.cache.set(cacheKey, translatedText);
      return translatedText;
    } catch (error) {
      console.error('LibreTranslate error:', error);
      return text;
    }
  }

  // Batch translate multiple texts at once (more efficient)
  async batchTranslate(texts, targetLang, provider = 'google') {
    const translations = {};
    
    for (const key in texts) {
      const text = texts[key];
      
      switch (provider) {
        case 'google':
          translations[key] = await this.translateWithGoogle(text, targetLang);
          break;
        case 'libre':
          translations[key] = await this.translateWithLibre(text, targetLang);
          break;
        default:
          translations[key] = text;
      }
      
      // Add small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return translations;
  }

  // Save translations to localStorage for offline use
  saveToCache(translations, language) {
    localStorage.setItem(`translations_${language}`, JSON.stringify(translations));
  }

  // Load translations from localStorage
  loadFromCache(language) {
    const cached = localStorage.getItem(`translations_${language}`);
    return cached ? JSON.parse(cached) : null;
  }
}

export default new TranslationService();

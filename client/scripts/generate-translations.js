// Script to generate translations for all languages from English base
// Run with: node scripts/generate-translations.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Language mapping
const languages = {
  hi: { code: 'hi', name: 'Hindi' },
  mr: { code: 'mr', name: 'Marathi' },
  ta: { code: 'ta', name: 'Tamil' },
  te: { code: 'te', name: 'Telugu' },
  bn: { code: 'bn', name: 'Bengali' },
  gu: { code: 'gu', name: 'Gujarati' }
};

// Check which languages need translation
function needsTranslation(langCode) {
  const outputPath = path.join(rootDir, 'public', 'locales', langCode, 'common.json');
  return !fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0;
}

// Google Translate API function
async function translateWithGoogle(text, targetLang) {
  try {
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
    const data = await response.json();
    return data[0][0][0];
  } catch (error) {
    console.error(`Translation error for "${text.substring(0, 30)}...":`, error.message);
    return text;
  }
}

// Translate all keys for a language with rate limiting
async function translateLanguage(translations, langCode) {
  const result = {};
  const keys = Object.keys(translations);
  
  console.log(`\nTranslating to ${languages[langCode].name} (${langCode}) - ${keys.length} strings`);
  
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const text = translations[key];
    
    // Skip strings with HTML tags to avoid breaking markup
    if (text.includes('<') || text.includes('>')) {
      result[key] = text;
      console.log(`  [${i + 1}/${keys.length}] ${key}: kept English (contains HTML)`);
      continue;
    }
    
    const translated = await translateWithGoogle(text, langCode);
    result[key] = translated;
    
    console.log(`  [${i + 1}/${keys.length}] ${key}: ${text.substring(0, 40)} → ${translated.substring(0, 40)}`);
    
    // Rate limit: 50ms delay between requests
    if (i < keys.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  
  return result;
}

// Main execution
async function main() {
  // Load English translations
  const enFilePath = path.join(rootDir, 'public', 'locales', 'en', 'common.json');
  const enTranslations = JSON.parse(fs.readFileSync(enFilePath, 'utf8'));
  
  console.log(`Loaded ${Object.keys(enTranslations).length} English translation keys`);
  
  let pendingLanguages = Object.entries(languages).filter(([code]) => needsTranslation(code));
  
  if (pendingLanguages.length === 0) {
    console.log('✅ All languages already translated!');
    return;
  }
  
  console.log(`Translating ${pendingLanguages.length} languages: ${pendingLanguages.map(([code, info]) => info.name).join(', ')}`);
  
  for (const [langCode, langInfo] of pendingLanguages) {
    console.log(`\n=== Processing ${langInfo.name} (${langCode}) ===`);
    
    const translated = await translateLanguage(enTranslations, langCode);
    
    // Save to file
    const outputPath = path.join(rootDir, 'public', 'locales', langCode, 'common.json');
    fs.writeFileSync(outputPath, JSON.stringify(translated, null, 2));
    console.log(`✓ Saved to ${outputPath} (${Object.keys(translated).length} keys)`);
  }
  
  console.log('\n✅ All translations generated successfully!');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

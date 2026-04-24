import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GiWheat } from "react-icons/gi";
import { io } from "socket.io-client";
import { useTranslation } from "../i18n/config.jsx";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const SARVAM_API_KEY = import.meta.env.VITE_SARVAM_API_KEY;
const MODEL = "openai/gpt-4o-mini";
const SARVAM_TTS_URL = "https://api.sarvam.ai/text-to-speech";
const SARVAM_STT_URL = "https://api.sarvam.ai/speech-to-text";

// ─── LANGUAGES ───────────────────────────────────────────────────────────────
const LANGUAGES = [
  {
    code: "en-US",
    name: "English",
    flag: "🇺🇸",
    sarvamCode: null,
    sarvamVoice: null,
    instruction: "You MUST reply strictly in English only. Do not use any other language.",
  },
  {
    code: "hi-IN",
    name: "हिन्दी",
    flag: "🇮🇳",
    sarvamCode: "hi-IN",
    sarvamVoice: "meera",
    instruction: "आपको केवल और केवल हिंदी में जवाब देना है। कोई भी अंग्रेजी शब्द या वाक्य मत लिखो।",
  },
  {
    code: "mr-IN",
    name: "मराठी",
    flag: "🇮🇳",
    sarvamCode: "mr-IN",
    sarvamVoice: "meera",
    instruction: "तुम्ही फक्त मराठीत उत्तर द्यायला हवे. एकही इंग्रजी शब्द वापरू नका.",
  },
  {
    code: "ta-IN",
    name: "தமிழ்",
    flag: "🇮🇳",
    sarvamCode: "ta-IN",
    sarvamVoice: "pavithra",
    instruction: "நீங்கள் கண்டிப்பாக தமிழில் மட்டும் பதில் சொல்லவேண்டும். ஆங்கிலம் பயன்படுத்தாதீர்கள்.",
  },
  {
    code: "te-IN",
    name: "తెలుగు",
    flag: "🇮🇳",
    sarvamCode: "te-IN",
    sarvamVoice: "arvind",
    instruction: "మీరు తప్పనిసరిగా తెలుగులో మాత్రమే సమాధానం ఇవ్వాలి. ఆంగ్లం వాడకూడదు.",
  },
  {
    code: "bn-BD",
    name: "বাংলা",
    flag: "🇧🇩",
    sarvamCode: "bn-IN",
    sarvamVoice: "amartya",
    instruction: "আপনাকে অবশ্যই শুধুমাত্র বাংলায় উত্তর দিতে হবে। ইংরেজি ব্যবহার করা যাবে না।",
  },
  {
    code: "kn-IN",
    name: "ಕನ್ನಡ",
    flag: "🇮🇳",
    sarvamCode: "kn-IN",
    sarvamVoice: "arvind",
    instruction: "ನೀವು ಕಡ್ಡಾಯವಾಗಿ ಕನ್ನಡದಲ್ಲಿ ಮಾತ್ರ ಉತ್ತರ ನೀಡಬೇಕು. ಇಂಗ್ಲಿಷ್ ಬಳಸಬಾರದು.",
  },
  {
    code: "pa-IN",
    name: "ਪੰਜਾਬੀ",
    flag: "🇮🇳",
    sarvamCode: "pa-IN",
    sarvamVoice: "meera",
    instruction: "ਤੁਹਾਨੂੰ ਸਿਰਫ਼ ਪੰਜਾਬੀ ਵਿੱਚ ਜਵਾਬ ਦੇਣਾ ਹੈ। ਕੋਈ ਅੰਗਰੇਜ਼ੀ ਨਹੀਂ।",
  },
  {
    code: "es-ES",
    name: "Español",
    flag: "🇪🇸",
    sarvamCode: null,
    sarvamVoice: null,
    instruction: "DEBES responder ÚNICAMENTE en español. Ninguna palabra en inglés.",
  },
  {
    code: "fr-FR",
    name: "Français",
    flag: "🇫🇷",
    sarvamCode: null,
    sarvamVoice: null,
    instruction: "Tu DOIS répondre UNIQUEMENT en français. Aucun mot en anglais.",
  },
];

// ─── ROLE SYSTEM PROMPTS ──────────────────────────────────────────────────────
const ROLE_PROMPTS = {
  farmer: (langInstruction) => `You are AgriBot — the intelligent assistant of GramOS, India's rural economic operating system.

⚠️ ABSOLUTE LANGUAGE RULE: ${langInstruction} This rule overrides everything else. Never switch languages.

YOUR ROLE: You serve FARMERS. You are their trusted advisor, market intelligence engine, and financial guide.

MISSING CONTEXT PROTOCOL — CRITICAL:
When the user does NOT mention location, crop, season, soil type, budget, or any other specific detail needed to answer well, you MUST NOT say "please provide your location" or ask for info upfront. Instead:
1. Give a USEFUL answer using the most common/likely Indian scenario as default (e.g., assume North India plains, Kharif season, mixed soil, small 2-5 acre holding).
2. At the END of your reply, add one soft follow-up like: "For your exact area, tell me your district or state — I can sharpen this advice."
3. NEVER refuse to answer or give a blank/generic "I need more info" response.
4. If crop is missing: answer for top 3 most common crops in that season.
5. If season is missing: answer for the current likely season based on general Indian agricultural calendar.
6. If state/district is missing: give pan-India answer with regional variations noted briefly.
7. If budget is missing: give answers across low/medium/high budget tiers briefly.

CORE CAPABILITIES:
1. CROP INTELLIGENCE - AI crop recommendations, pest & disease ID, soil health, weather impact
2. MARKET INTELLIGENCE & FAIR PRICING - mandi rates, walk-away price, buyer discovery
3. INPUT MARKETPLACE - verified seed/fertilizer/pesticide vendors, bulk buying
4. LIVING PRODUCT PASSPORT - QR tracking, farm-to-buyer journey, margin transparency
5. RURAL CREDIT SCORE - GramOS credit score, loan guidance, KCC tips
6. GOVERNMENT SCHEMES - PM-Kisan, PMFBY, KCC, state schemes, document checklists
7. WORKFORCE - post harvest jobs, fair wage benchmarks

PERSONALITY: Direct, practical, confident — like a mentor who has farmed his whole life but understands markets too. No jargon. Always actionable.
RESPONSE LENGTH: Under 150 words unless farmer asks for detailed steps. Use line breaks.`,

  retailer: (langInstruction) => `You are AgriBot — the supply chain intelligence assistant of GramOS, India's rural economic operating system.

⚠️ ABSOLUTE LANGUAGE RULE: ${langInstruction} This rule overrides everything else. Never switch languages.

YOUR ROLE: You serve RETAILERS and BUYERS. You are their procurement advisor, supplier discovery engine, and quality intelligence system.

MISSING CONTEXT PROTOCOL — CRITICAL:
When the user does NOT mention location, commodity, quantity, budget, or timeline, you MUST NOT ask for it upfront or refuse to answer. Instead:
1. Give a USEFUL answer using the most common Indian retail/procurement scenario as default.
2. At the END, add one soft follow-up: "Share your city or target commodity — I can find specific suppliers for you."
3. NEVER say "I need your location to help." Give value first, ask softly after.

CORE CAPABILITIES:
1. SUPPLIER DISCOVERY & PROCUREMENT - verified farmers, bulk order optimization, seasonal forecasting
2. PRODUCT PASSPORT & QUALITY VERIFICATION - QR passports, certifications, margin transparency
3. PRICING & NEGOTIATION INTELLIGENCE - mandi benchmarks, demand-supply signals, price trend alerts
4. INVENTORY & STOCK MANAGEMENT - low stock alerts, cold storage, wastage reduction
5. FARMER NETWORK BUILDING - contract farming, GramOS credit scores
6. COMPLIANCE - FSSAI, AGMARK, import/export documentation

PERSONALITY: Business-focused, data-driven, efficient. Lead with the most actionable insight.
RESPONSE LENGTH: Under 150 words. Use numbered lists for multi-step processes.`,

  villager: (langInstruction) => `You are AgriBot — the livelihood assistant of GramOS, India's rural economic operating system.

⚠️ ABSOLUTE LANGUAGE RULE: ${langInstruction} This rule overrides everything else. Never switch languages.

YOUR ROLE: You serve RURAL VILLAGERS. You are their job finder, skill coach, and income guide.

MISSING CONTEXT PROTOCOL — CRITICAL:
When the user does NOT mention location, skill level, crop type, or availability, you MUST NOT ask upfront or say you cannot help. Instead:
1. Give a USEFUL answer assuming a general rural Indian villager — unskilled to semi-skilled, available for field work.
2. At the END, add one soft follow-up: "Tell me your village/district — I can find jobs closest to you."
3. NEVER say "I need your location." Always give actionable info first.

CORE CAPABILITIES:
1. JOB DISCOVERY & MATCHING - harvest jobs, pay rates, seasonal work calendar
2. SKILL DEVELOPMENT ACADEMY - vernacular micro-skill modules, skill badges
3. VERIFIED WORK HISTORY - QR check-ins, "Trusted Villager" badge, gig profile
4. INCOME & PAYMENT TRACKING - gig earnings, disputes, rural credit score
5. SAFETY & EQUIPMENT - PPE, pesticide safety, first aid
6. FINANCIAL INCLUSION - Jan Dhan, PMJJBY, PMSBY, MGNREGS

PERSONALITY: Supportive, encouraging, clear. Speak simply like a trusted elder.
RESPONSE LENGTH: Under 120 words. Use numbered steps. Avoid complex vocabulary.`,

  consumer: (langInstruction) => `You are AgriBot — the fresh produce companion of GramOS, India's rural economic operating system.

⚠️ ABSOLUTE LANGUAGE RULE: ${langInstruction} This rule overrides everything else. Never switch languages.

YOUR ROLE: You serve CONSUMERS. Help them find the freshest produce, understand what they're buying, and connect with farmers.

MISSING CONTEXT PROTOCOL — CRITICAL:
When the user does NOT mention location, budget, dietary preference, or specific produce, you MUST NOT ask for it first or say you cannot help. Instead:
1. Give a USEFUL answer based on what is commonly in season across India right now.
2. At the END, add one soft follow-up: "Let me know your city — I can find farmers and markets near you!"
3. NEVER say "I need your location to answer." Always give useful general info first.

CORE CAPABILITIES:
1. FRESH PRODUCE DISCOVERY - seasonal fruits/vegetables, price comparison, freshness indicator
2. PRODUCT PASSPORT - QR scanning, pesticide records, full chain timestamps
3. QUALITY & FRESHNESS GUIDANCE - grading, organic vs conventional, cold chain
4. DIRECT FARMER CONNECTION - verified farmers marketplace, quality ratings
5. NUTRITION & RECIPES - seasonal benefits, recipes, storage tips, preservation
6. SEASONAL AWARENESS - month-wise availability, upcoming produce

PERSONALITY: Warm, friendly, enthusiastic about good food. Speak like a knowledgeable friend.
RESPONSE LENGTH: Under 130 words. Be conversational.`,
};

// ─── ROLE META ────────────────────────────────────────────────────────────────
const ROLE_META = {
  farmer: {
    label: "Farmer",
    emoji: "🌾",
    color: "#15803d",
    bg: "#dcfce7",
    greet: 'Ready to help you grow better and earn more 💪\n\nTry asking:\n• "Best crop this season in my area?"\n• "Current tomato mandi rates"\n• "Am I eligible for PM-Kisan?"',
  },
  retailer: {
    label: "Retailer",
    emoji: "🏪",
    color: "#1d4ed8",
    bg: "#dbeafe",
    greet: 'Your procurement intelligence engine is live 📊\n\nTry asking:\n• "Find tomato suppliers near Mumbai"\n• "When will onion prices peak?"\n• "How do I verify QR product passport?"',
  },
  villager: {
    label: "Villager",
    emoji: "🏡",
    color: "#92400e",
    bg: "#fef3c7",
    greet: "Find work, build skills, earn more — I've got you 🤝\n\nTry asking:\n• \"Harvest jobs near Nashik\"\n• \"How do I earn skill badges?\"\n• \"When is rice harvest season?\"",
  },
  consumer: {
    label: "Consumer",
    emoji: "🛒",
    color: "#7c3aed",
    bg: "#ede9fe",
    greet: "Let's find the freshest produce near you! 🥦\n\nTry asking:\n• \"What vegetables are in season now?\"\n• \"Find organic farmers near me\"\n• \"What does the QR on my vegetables mean?\"",
  },
};

// ─── SARVAM TTS ───────────────────────────────────────────────────────────────
let currentAudio = null;

function stopAllAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = "";
    currentAudio = null;
  }
}

async function speakText(text, lang, onEnd) {
  stopAllAudio();
  if (!SARVAM_API_KEY || !lang.sarvamCode) { onEnd?.(); return; }
  const clean = text.replace(/[*_~`#•\-]/g, " ").replace(/\s+/g, " ").trim().substring(0, 500);
  try {
    const res = await fetch(SARVAM_TTS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-subscription-key": SARVAM_API_KEY },
      body: JSON.stringify({ inputs: [clean], target_language_code: lang.sarvamCode, speaker: lang.sarvamVoice, pitch: 0, pace: 1.0, loudness: 1.5, speech_sample_rate: 22050, enable_preprocessing: true, model: "bulbul:v1" }),
    });
    const data = await res.json();
    if (data.audios?.[0]) {
      const audio = new Audio(`data:audio/wav;base64,${data.audios[0]}`);
      currentAudio = audio;
      audio.onended = () => { currentAudio = null; onEnd?.(); };
      audio.onerror = () => { currentAudio = null; onEnd?.(); };
      audio.play();
      return;
    }
  } catch {}
  onEnd?.();
}

// ─── SARVAM STT ───────────────────────────────────────────────────────────────
function startSarvamSTT(lang) {
  let mediaStream = null;
  let mediaRecorder = null;
  let chunks = [];

  const promise = new Promise(async (resolve, reject) => {
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      mediaRecorder = new MediaRecorder(mediaStream, { mimeType });
      chunks = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      mediaRecorder.onstop = async () => {
        mediaStream.getTracks().forEach((t) => t.stop());
        if (chunks.length === 0) { reject(new Error("no audio")); return; }
        const blob = new Blob(chunks, { type: mimeType });
        try {
          const form = new FormData();
          form.append("file", blob, "audio.webm");
          form.append("language_code", lang.sarvamCode);
          form.append("model", "saarika:v2");
          form.append("with_timestamps", "false");
          const res = await fetch(SARVAM_STT_URL, {
            method: "POST",
            headers: { "api-subscription-key": SARVAM_API_KEY },
            body: form,
          });
          if (!res.ok) throw new Error("sarvam stt failed");
          const data = await res.json();
          const transcript = (data.transcript || "").trim();
          if (!transcript) throw new Error("empty transcript");
          resolve({ text: transcript });
        } catch (err) {
          reject(err);
        }
      };
      mediaRecorder.start();
    } catch (err) {
      reject(err);
    }
  });

  const stop = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
  };

  return { stop, promise };
}

// ─── SOCKET ───────────────────────────────────────────────────────────────────
const socket = io("http://localhost:8000");

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function Chatbot() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [userRole, setUserRole] = useState("consumer");
  const [lang, setLang] = useState(LANGUAGES[0]);
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [minimized, setMinimized] = useState(true);
  const [typing, setTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [chatImage, setChatImage] = useState(null);

  const chatRef = useRef(null);
  const textareaRef = useRef(null);
  const lastAttachedImage = useRef(null);
  const activeCallSid = useRef(null);
  const sarvamSessionRef = useRef(null);

  // ── Load role ──
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      const role = (u.role || u.userRole || "consumer").toLowerCase();
      if (ROLE_META[role]) setUserRole(role);
    } catch {}
  }, []);

  // ── Greet on open ──
  useEffect(() => {
    if (!minimized && messages.length === 0) {
      const meta = ROLE_META[userRole] || ROLE_META.consumer;
      setMessages([{ role: "bot", text: `${t("chatbot.greeting")}\n\n${meta.greet}`, id: Date.now() }]);
    }
  }, [minimized]);

  // ── Re-greet on role change ──
  useEffect(() => {
    if (!minimized) {
      const meta = ROLE_META[userRole] || ROLE_META.consumer;
      setMessages([{ role: "bot", text: `${t("chatbot.greeting")}\n\n${meta.greet}`, id: Date.now() }]);
      setHistory([]);
    }
  }, [userRole]);

  // ── Auto-scroll ──
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, typing]);

  const stopSpeaking = useCallback(() => {
    stopAllAudio();
    setSpeaking(false);
  }, []);

  const toggleMic = useCallback(() => {
  if (listening) {
    if (sarvamSessionRef.current) { sarvamSessionRef.current.stop(); sarvamSessionRef.current = null; }
    setListening(false);
    return;
  }
  if (!SARVAM_API_KEY || !lang.sarvamCode) return;
  setListening(true);
  const session = startSarvamSTT(lang);
  sarvamSessionRef.current = session;
  const autoStop = setTimeout(() => { if (sarvamSessionRef.current === session) session.stop(); }, 8000);
  session.promise
    .then(({ text }) => { clearTimeout(autoStop); sarvamSessionRef.current = null; setListening(false); sendMessageFn(text); })
    .catch(() => { clearTimeout(autoStop); sarvamSessionRef.current = null; setListening(false); });
}, [listening, lang, sendMessageFn]);

  // ─── SEND MESSAGE ─────────────────────────────────────────────────────────
  const sendMessageFn = useCallback(
    async (voiceText) => {
      const text = (voiceText !== undefined ? voiceText : input).trim();
      const currentImage = chatImage;

      if ((!text && !currentImage) || typing) return;

      if (voiceText === undefined) setInput("");
      if (currentImage) lastAttachedImage.current = currentImage;
      setChatImage(null);

      const userMsg = { role: "user", text: text || t("chatbot.uploadedImage"), id: Date.now() };
      if (currentImage) userMsg.image = URL.createObjectURL(currentImage);
      setMessages((prev) => [...prev, userMsg]);
      setTyping(true);
      stopSpeaking();

      const basePrompt = (ROLE_PROMPTS[userRole] || ROLE_PROMPTS.consumer)(lang.instruction);
      const systemPrompt =
        basePrompt +
        "\n\n🚨 AGENTIC CAPABILITIES 🚨\nYou are now a FULLY AGENTIC AI. You have tools available to control the GramOS platform UI. If the user asks to navigate somewhere, view something, open their profile, logout, or check a specific dashboard section, you MUST use the `execute_platform_action` tool to do it for them! When you execute an action using the tool, also provide a helpful natural language response. NEVER say you can't do it, just use the tool!";

      const updatedHistory = [...history, { role: "user", content: text }];

      try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "HTTP-Referer": window.location.origin,
            "X-Title": "GramOS AgriBot",
          },
          body: JSON.stringify({
            model: MODEL,
            temperature: 0.7,
            max_tokens: 400,
            messages: [{ role: "system", content: systemPrompt }, ...updatedHistory],
            tools: [
              {
                type: "function",
                function: {
                  name: "execute_platform_action",
                  description:
                    "Execute a platform UI interaction like navigating to a dashboard page, opening a modal, or logging out.",
                  parameters: {
                    type: "object",
                    properties: {
                      actionType: {
                        type: "string",
                        description: "Allowed values: 'navigate_section', 'navigate_url', 'open_modal', 'logout'.",
                      },
                      target: {
                        type: "string",
                        description:
                          "For 'navigate_section': 'marketplace','produce','workforce','scanner','map','credit','schemes' (Farmers) OR 'jobs','academy','nptel','earnings','alert' (Villagers) OR 'browse','analytics','network','contracts','qr' (Retailers). For 'navigate_url': app path like '/dashboard/farmer'. For 'open_modal': 'profile','scan','add_produce'.",
                      },
                    },
                    required: ["actionType"],
                  },
                },
              },
              {
                type: "function",
                function: {
                  name: "add_farmer_produce",
                  description:
                    "Automatically add a new product or crop to the farmer's inventory. ONLY call when user explicitly provides crop name, quantity (kg), base price (₹), and locality.",
                  parameters: {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "Name of the produce/crop" },
                      type: {
                        type: "string",
                        description: "One of: 'Vegetable','Fruit','Grain','Leafy Greens','Pulse','Spice','Dairy','Other'",
                      },
                      quantity: { type: "number", description: "Quantity in kg" },
                      basePrice: { type: "number", description: "Base price per kg in INR" },
                      locality: { type: "string", description: "City or location of harvest" },
                    },
                    required: ["name", "type", "quantity", "basePrice", "locality"],
                  },
                },
              },
              {
                type: "function",
                function: {
                  name: "update_user_profile",
                  description:
                    "Update user profile settings. Use when user asks to change their location, name, phone, bio, crops, or language.",
                  parameters: {
                    type: "object",
                    properties: {
                      updates: {
                        type: "object",
                        description:
                          "Key-value pairs. Valid keys: 'name','phone','location','bio','language','crops','specialization','village'.",
                        additionalProperties: { type: "string" },
                      },
                    },
                    required: ["updates"],
                  },
                },
              },
            ],
          }),
        });

        const data = await res.json();
        const message = data.choices?.[0]?.message;
        let reply = message?.content || "";

        // ── Handle Tool Calls ──
        if (message?.tool_calls?.length > 0) {
          for (const toolCall of message.tool_calls) {
            try {
              const args = JSON.parse(toolCall.function.arguments);

              if (toolCall.function.name === "execute_platform_action") {
                if (args.actionType === "navigate_section") {
                  window.dispatchEvent(new CustomEvent("AGRIBOT_NAVIGATE", { detail: { section: args.target } }));
                  reply += (reply ? "\n\n" : "") + `Navigating to ${args.target} section...`;
                } else if (args.actionType === "open_modal") {
                  window.dispatchEvent(new CustomEvent("AGRIBOT_MODAL", { detail: { modal: args.target } }));
                  reply += (reply ? "\n\n" : "") + `Opening ${args.target}...`;
                } else if (args.actionType === "navigate_url") {
                  navigate(args.target);
                  reply += (reply ? "\n\n" : "") + `Navigating to ${args.target}...`;
                } else if (args.actionType === "logout") {
                  window.dispatchEvent(new CustomEvent("AGRIBOT_ACTION", { detail: { action: "logout" } }));
                  reply += (reply ? "\n\n" : "") + `Logging out...`;
                }
              } else if (toolCall.function.name === "add_farmer_produce") {
                const user = JSON.parse(localStorage.getItem("user") || "{}");
                if (user?.email) {
                  const typeMap = { Vegetables: "Vegetable", Fruits: "Fruit", Grains: "Grain", Pulses: "Pulse", Spices: "Spice" };
                  const safeType = typeMap[args.type] || args.type || "Other";
                  const validatedName = (args.name || "").trim();
                  const validatedLocality = (args.locality || "").trim();
                  const validatedQty = Number(args.quantity) || 0;
                  const validatedPrice = Number(args.basePrice) || 0;

                  if (!validatedName || !validatedLocality || validatedQty <= 0 || validatedPrice <= 0) {
                    reply += (reply ? "\n\n" : "") + `⚠️ I couldn't add the crop — please provide crop name, quantity, price, and locality.`;
                  } else {
                    const formData = new FormData();
                    formData.append("name", validatedName);
                    formData.append("type", safeType);
                    formData.append("quantity", validatedQty);
                    formData.append("basePrice", validatedPrice);
                    formData.append("locality", validatedLocality);
                    formData.append("farmerEmail", user.email);
                    if (lastAttachedImage.current) {
                      formData.append("image", lastAttachedImage.current);
                      lastAttachedImage.current = null;
                    }
                    try {
                      await axios.post("http://localhost:8000/api/v1/products", formData);
                      window.dispatchEvent(new CustomEvent("AGRIBOT_PRODUCE_ADDED"));
                      reply += (reply ? "\n\n" : "") + `✅ Added ${validatedQty}kg of ${validatedName} from ${validatedLocality} at ₹${validatedPrice}/kg to your inventory!`;
                    } catch {
                      reply += (reply ? "\n\n" : "") + `❌ Tried to add your produce but hit a system error. Please check your connection.`;
                    }
                  }
                } else {
                  reply += (reply ? "\n\n" : "") + `⚠️ Couldn't add the crop — please log in first.`;
                }
              } else if (toolCall.function.name === "update_user_profile") {
                window.dispatchEvent(new CustomEvent("AGRIBOT_UPDATE_PROFILE", { detail: args.updates }));
                reply += (reply ? "\n\n" : "") + `✅ Updated your profile settings!`;
              }
            } catch (e) {
              console.error("Tool call error:", e);
            }
          }
        }

        if (!reply) reply = t("chatbot.actionExecuted");

        setMessages((prev) => [...prev, { role: "bot", text: reply, id: Date.now() + 1 }]);
        setHistory([...updatedHistory, { role: "assistant", content: reply }]);

        // ── Twilio reply ──
        if (activeCallSid.current) {
          axios
            .post("http://localhost:8000/api/v1/voice/reply", {
              callSid: activeCallSid.current,
              text: reply.substring(0, 1000),
            })
            .catch((err) => console.error("Twilio reply error:", err));
          activeCallSid.current = null;
        }

        // ── TTS ──
        if (voiceOn) {
          setSpeaking(true);
          speakText(reply, lang, () => setSpeaking(false));
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: t("chatbot.connectionError"), id: Date.now() + 1 },
        ]);
      } finally {
        setTyping(false);
      }
    },
    [input, typing, history, lang, userRole, voiceOn, chatImage, stopSpeaking, navigate, t],
  );

  // ── Twilio socket ──
  useEffect(() => {
    const handleTwilioSpeech = ({ callSid, text }) => {
      if (minimized) setMinimized(false);
      activeCallSid.current = callSid;
      setTimeout(() => sendMessageFn(text), 100);
    };
    socket.on("twilio_speech", handleTwilioSpeech);
    return () => { socket.off("twilio_speech", handleTwilioSpeech); };
  }, [minimized, sendMessageFn]);

  const clearChat = () => {
    stopSpeaking();
    setHistory([]);
    const meta = ROLE_META[userRole] || ROLE_META.consumer;
    setMessages([{ role: "bot", text: `${t("chatbot.chatCleared")}\n\n${meta.greet}`, id: Date.now() }]);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessageFn();
    }
  };

  const meta = ROLE_META[userRole] || ROLE_META.consumer;
  const sarvamAvailable = !!(lang.sarvamCode && SARVAM_API_KEY);

  const QUICK = {
    farmer:   [t("chatbot.quick.farmer.crop"),       t("chatbot.quick.farmer.mandi"),        t("chatbot.quick.farmer.pmkisan")],
    retailer: [t("chatbot.quick.retailer.suppliers"), t("chatbot.quick.retailer.trend"),      t("chatbot.quick.retailer.qr")],
    villager: [t("chatbot.quick.villager.jobs"),      t("chatbot.quick.villager.badges"),     t("chatbot.quick.villager.income")],
    consumer: [t("chatbot.quick.consumer.seasonal"),  t("chatbot.quick.consumer.localFarmers"), t("chatbot.quick.consumer.qr")],
  };

  // ── MINIMIZED ──────────────────────────────────────────────────────────────
  if (minimized) {
    return (
      <>
        <style>{`
          @keyframes agri-ping { 0%{transform:scale(1);opacity:0.5} 70%,100%{transform:scale(1.45);opacity:0} }
          @keyframes agri-pop  { 0%{transform:scale(0.4);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
        `}</style>
        <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999 }}>
          <div style={{ position:"absolute", inset:-8, borderRadius:"50%", border:"2px solid #16a34a", opacity:0.5, animation:"agri-ping 2.2s ease-out infinite", pointerEvents:"none" }} />
          <button
            onClick={() => setMinimized(false)}
            style={{ width:62, height:62, borderRadius:"50%", background:"linear-gradient(145deg,#16a34a,#14532d)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 6px 24px rgba(21,128,61,0.5)", animation:"agri-pop 0.4s ease", transition:"transform 0.2s,box-shadow 0.2s" }}
            onMouseOver={e => { e.currentTarget.style.transform="scale(1.1)"; e.currentTarget.style.boxShadow="0 8px 30px rgba(21,128,61,0.6)"; }}
            onMouseOut={e => { e.currentTarget.style.transform="scale(1)"; e.currentTarget.style.boxShadow="0 6px 24px rgba(21,128,61,0.5)"; }}
          >
            <GiWheat style={{ fontSize:30, color:"#fff" }} />
          </button>
          <div style={{ position:"absolute", bottom:-1, right:-1, width:22, height:22, borderRadius:"50%", background:meta.bg, border:`2px solid ${meta.color}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, pointerEvents:"none" }}>
            {meta.emoji}
          </div>
        </div>
      </>
    );
  }

  // ── EXPANDED ──────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes agri-slide-up { from{opacity:0;transform:translateY(20px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes agri-msg-in   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes agri-blink    { 0%,100%{opacity:1} 50%{opacity:0.25} }
        @keyframes agri-dot      { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
        @keyframes agri-wave     { 0%,100%{transform:scaleY(0.4)} 50%{transform:scaleY(1.5)} }
        .agri-msg        { animation:agri-msg-in 0.22s ease; }
        .agri-scrollbar::-webkit-scrollbar { width:3px; }
        .agri-scrollbar::-webkit-scrollbar-thumb { background:rgba(22,163,74,0.2); border-radius:4px; }
        .agri-input:focus { outline:none; border-color:#16a34a !important; box-shadow:0 0 0 3px rgba(22,163,74,0.12) !important; }
        .agri-chip:hover  { background:#d1fae5 !important; }
        .agri-icon-btn:hover { background:rgba(255,255,255,0.18) !important; }
      `}</style>

      <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999, width:390, height:610, borderRadius:22, boxShadow:"0 24px 64px rgba(0,0,0,0.16),0 4px 16px rgba(0,0,0,0.08)", display:"flex", flexDirection:"column", overflow:"hidden", background:"#fff", fontFamily:"'Segoe UI',-apple-system,system-ui,sans-serif", animation:"agri-slide-up 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}>

        {/* ─ HEADER ─ */}
        <div style={{ background:"linear-gradient(135deg,#14532d 0%,#166534 55%,#15803d 100%)", padding:"14px 14px 10px", position:"relative", overflow:"hidden", flexShrink:0 }}>
          {[{w:90,h:90,t:-30,l:-15,op:0.07},{w:60,h:60,t:10,l:90,op:0.06},{w:40,h:40,b:-10,r:80,op:0.09}].map((c,i) => (
            <div key={i} style={{ position:"absolute", width:c.w, height:c.h, borderRadius:"50%", background:"#fff", opacity:c.op, top:c.t, left:c.l, bottom:c.b, right:c.r, pointerEvents:"none" }} />
          ))}

          {/* Title row */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", position:"relative" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:42, height:42, borderRadius:"50%", background:"rgba(255,255,255,0.14)", border:"1.5px solid rgba(255,255,255,0.28)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <GiWheat style={{ fontSize:24, color:"#fff" }} />
              </div>
              <div>
                <div style={{ color:"#fff", fontWeight:700, fontSize:16, letterSpacing:0.2 }}>AgriBot</div>
                <div style={{ color:"#86efac", fontSize:11 }}>
                  GramOS · {sarvamAvailable ? "Sarvam AI" : "Text only"}
                </div>
              </div>
            </div>

            <div style={{ display:"flex", alignItems:"center", gap:5 }}>
              {speaking && (
                <div style={{ display:"flex", alignItems:"center", gap:3, marginRight:2 }}>
                  {[0, 0.12, 0.24, 0.12, 0].map((d, i) => (
                    <div key={i} style={{ width:3, height:14, background:"#4ade80", borderRadius:3, animation:`agri-wave 0.65s ${d}s ease-in-out infinite` }} />
                  ))}
                </div>
              )}

              {/* Voice toggle — only when Sarvam available */}
              {sarvamAvailable && (
                <button
                  onClick={() => { const next = !voiceOn; setVoiceOn(next); if (!next) stopSpeaking(); }}
                  className="agri-icon-btn"
                  title={voiceOn ? t("chatbot.voiceOn") : t("chatbot.voiceOff")}
                  style={{ width:30, height:30, borderRadius:8, border:"none", background:voiceOn?"rgba(74,222,128,0.22)":"rgba(255,255,255,0.1)", outline:voiceOn?"1.5px solid #4ade80":"1px solid rgba(255,255,255,0.18)", cursor:"pointer", fontSize:15, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s" }}
                >
                  {voiceOn ? "🔊" : "🔇"}
                </button>
              )}

              {/* Clear */}
              <button
                onClick={clearChat}
                className="agri-icon-btn"
                style={{ width:30, height:30, borderRadius:8, border:"none", background:"rgba(255,255,255,0.1)", outline:"1px solid rgba(255,255,255,0.18)", cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s" }}
              >
                🗑️
              </button>

              {/* Close */}
              <button
                onClick={() => setMinimized(true)}
                className="agri-icon-btn"
                style={{ width:30, height:30, borderRadius:8, border:"none", background:"rgba(255,255,255,0.1)", outline:"1px solid rgba(255,255,255,0.18)", cursor:"pointer", fontSize:14, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s" }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Role + Language row */}
          <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:9, position:"relative" }}>
            <span style={{ background:meta.bg, color:meta.color, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, border:`1px solid ${meta.color}35`, letterSpacing:0.2 }}>
              {meta.emoji} {meta.label}
            </span>

            <select
              value={lang.code}
              onChange={e => { const l = LANGUAGES.find(x => x.code === e.target.value); if (l) setLang(l); }}
              disabled={listening}
              style={{ fontSize:11, fontWeight:600, background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.22)", borderRadius:20, padding:"3px 10px", color:"#fff", cursor:"pointer", outline:"none" }}
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code} style={{ color:"#111", background:"#fff" }}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>

            {listening && (
              <span style={{ marginLeft:"auto", fontSize:11, color:"#fca5a5", display:"flex", alignItems:"center", gap:5, fontWeight:600 }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:"#f87171", animation:"agri-blink 0.7s infinite" }} />
                {t("chatbot.listening")}
              </span>
            )}
          </div>
        </div>

        {/* ─ MESSAGES ─ */}
        <div
          ref={chatRef}
          className="agri-scrollbar"
          style={{ flex:1, overflowY:"auto", padding:"14px 12px", background:"linear-gradient(175deg,#f0fdf4 0%,#fff 55%)", display:"flex", flexDirection:"column", gap:8 }}
        >
          {messages.map(msg => (
            <div key={msg.id} className="agri-msg" style={{ display:"flex", justifyContent:msg.role==="user"?"flex-end":"flex-start" }}>
              {msg.role === "bot" && (
                <div style={{ width:30, height:30, borderRadius:"50%", background:"linear-gradient(135deg,#15803d,#14532d)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginRight:7, marginTop:2 }}>
                  <GiWheat style={{ fontSize:15, color:"#fff" }} />
                </div>
              )}
              <div style={{ maxWidth:"78%", padding:"9px 13px", borderRadius:msg.role==="user"?"18px 18px 4px 18px":"4px 18px 18px 18px", background:msg.role==="user"?"linear-gradient(135deg,#16a34a,#15803d)":"#fff", color:msg.role==="user"?"#fff":"#111", fontSize:13.5, lineHeight:1.6, whiteSpace:"pre-wrap", wordBreak:"break-word", border:msg.role==="bot"?"1px solid #d1fae5":"none", boxShadow:msg.role==="bot"?"0 1px 5px rgba(0,0,0,0.05)":"0 2px 10px rgba(22,163,74,0.22)" }}>
                {msg.image && (
                  <img src={msg.image} alt="user upload" style={{ width:"100%", borderRadius:8, marginBottom:6, maxHeight:150, objectFit:"cover" }} />
                )}
                {msg.text}
              </div>
            </div>
          ))}

          {typing && (
            <div className="agri-msg" style={{ display:"flex", alignItems:"flex-end", gap:7 }}>
              <div style={{ width:30, height:30, borderRadius:"50%", background:"linear-gradient(135deg,#15803d,#14532d)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <GiWheat style={{ fontSize:15, color:"#fff" }} />
              </div>
              <div style={{ background:"#fff", border:"1px solid #d1fae5", borderRadius:"4px 18px 18px 18px", padding:"11px 16px", display:"flex", gap:5, boxShadow:"0 1px 5px rgba(0,0,0,0.05)" }}>
                {[0, 0.18, 0.36].map((d, i) => (
                  <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:"#16a34a", animation:`agri-dot 1.1s ${d}s ease-in-out infinite` }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─ INPUT AREA ─ */}
        <div style={{ padding:"8px 12px 12px", borderTop:"1px solid #dcfce7", background:"#fff", flexShrink:0 }}>
          {/* Quick chips */}
          <div style={{ display:"flex", gap:5, marginBottom:8, overflowX:"auto", paddingBottom:1 }}>
            {(QUICK[userRole] || QUICK.consumer).map(q => (
              <button key={q} onClick={() => sendMessageFn(q)} className="agri-chip" style={{ whiteSpace:"nowrap", fontSize:11, fontWeight:500, padding:"4px 10px", borderRadius:20, border:"1px solid #bbf7d0", background:"#f0fdf4", color:"#15803d", cursor:"pointer", flexShrink:0, transition:"background 0.15s" }}>
                {q}
              </button>
            ))}
          </div>

          {/* Image preview */}
          {chatImage && (
            <div style={{ position:"relative", marginBottom:8, display:"inline-block" }}>
              <img src={URL.createObjectURL(chatImage)} alt="preview" style={{ height:48, borderRadius:8, border:"2px solid #16a34a", objectFit:"cover" }} />
              <button onClick={() => setChatImage(null)} style={{ position:"absolute", top:-6, right:-6, background:"#ef4444", color:"white", border:"none", borderRadius:"50%", width:18, height:18, fontSize:10, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
            </div>
          )}

          <div style={{ display:"flex", gap:6, alignItems:"flex-end" }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => { setInput(e.target.value); e.target.style.height="auto"; e.target.style.height=Math.min(e.target.scrollHeight,88)+"px"; }}
              onKeyDown={handleKey}
              rows={1}
              placeholder={t("chatbot.messageInLanguage", { language: lang.name })}
              disabled={typing}
              className="agri-input agri-scrollbar"
              style={{ flex:1, resize:"none", padding:"9px 13px", border:"1.5px solid #d1fae5", borderRadius:14, fontSize:13.5, fontFamily:"inherit", background:"#fafafa", color:"#111", lineHeight:1.5, maxHeight:88, overflowY:"auto", transition:"border-color 0.2s,box-shadow 0.2s" }}
            />

            {/* Mic — greyed out for non-Sarvam languages */}
            <button
              onClick={toggleMic}
              disabled={typing || !lang.sarvamCode}
              title={!lang.sarvamCode ? "Mic not available for this language" : listening ? t("chatbot.stop") : "Speak"}
              style={{ width:40, height:40, borderRadius:12, flexShrink:0, border:"none", background:!lang.sarvamCode?"#e5e7eb":listening?"#ef4444":"#f0fdf4", outline:(!lang.sarvamCode||listening)?"none":"1.5px solid #bbf7d0", cursor:!lang.sarvamCode?"not-allowed":"pointer", fontSize:17, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s", animation:listening?"agri-blink 0.7s infinite":"none", boxShadow:listening?"0 2px 10px rgba(239,68,68,0.35)":"none", color:!lang.sarvamCode?"#9ca3af":"#16a34a", opacity:!lang.sarvamCode?0.45:1 }}
            >
              🎤
            </button>

            {/* Attachment */}
            <label
              style={{ width:40, height:40, borderRadius:12, flexShrink:0, background:"#f0fdf4", outline:"1.5px solid #bbf7d0", cursor:"pointer", fontSize:17, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s" }}
              title={t("chatbot.attachPhoto")}
            >
              <input type="file" accept="image/*" style={{ display:"none" }} onChange={e => { if (e.target.files[0]) setChatImage(e.target.files[0]); }} />
              📎
            </label>

            {/* Send */}
            <button
              onClick={() => sendMessageFn()}
              disabled={(!input.trim() && !chatImage) || typing}
              style={{ width:40, height:40, borderRadius:12, flexShrink:0, border:"none", background:(input.trim()||chatImage)&&!typing?"linear-gradient(135deg,#16a34a,#14532d)":"#e5e7eb", cursor:(input.trim()||chatImage)&&!typing?"pointer":"not-allowed", fontSize:19, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s", boxShadow:(input.trim()||chatImage)&&!typing?"0 3px 12px rgba(22,163,74,0.35)":"none" }}
            >
              ↑
            </button>
          </div>

          <div style={{ textAlign:"center", fontSize:10, color:"#9ca3af", marginTop:6 }}>
            {t("chatbot.footer", { language: lang.name })} · {lang.sarvamCode ? "Sarvam AI" : "Text only"}
          </div>
        </div>
      </div>
    </>
  );
}
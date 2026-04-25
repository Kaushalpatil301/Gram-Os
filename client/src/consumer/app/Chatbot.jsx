import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GiWheat } from "react-icons/gi";
import { io } from "socket.io-client";
import { useTranslation } from "../i18n/config.jsx";

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const MODEL = "openai/gpt-4o-mini";

const LANGUAGES_MAP = {
  en: { code: "en-US", name: "English", flag: "🇺🇸", voiceLang: "en-US", instruction: "You MUST reply strictly in English only. Do not use any other language." },
  hi: { code: "hi-IN", name: "हिन्दी", flag: "🇮🇳", voiceLang: "hi-IN", instruction: "आपको केवल और केवल हिंदी में जवाब देना है। कोई भी अंग्रेजी शब्द या वाक्य मत लिखो।" },
  mr: { code: "mr-IN", name: "मराठी", flag: "🇮🇳", voiceLang: "mr-IN", instruction: "तुम्ही फक्त मराठीत उत्तर द्यायला हवे. एकही इंग्रजी शब्द वापरू नका." },
  ta: { code: "ta-IN", name: "தமிழ்", flag: "🇮🇳", voiceLang: "ta-IN", instruction: "நீங்கள் கண்டிப்பாக தமிழில் மட்டும் பதில் சொல்லவேண்டும். ஆங்கிலம் பயன்படுத்தாதீர்கள்." },
  te: { code: "te-IN", name: "తెలుగు", flag: "🇮🇳", voiceLang: "te-IN", instruction: "మీరు తప్పనిసరిగా తెలుగులో మాత్రమే సమాధానం ఇవ్వాలి. ఆంగ్లం వాడకూడదు." },
  bn: { code: "bn-BD", name: "বাংলা", flag: "🇧🇩", voiceLang: "bn-BD", instruction: "আপনাকে অবশ্যই শুধুমাত্র বাংলায় উত্তর দিতে হবে। ইংরেজি ব্যবহার করা যাবে না।" },
  gu: { code: "gu-IN", name: "ગુજરાતી", flag: "🇮🇳", voiceLang: "gu-IN", instruction: "તમારે ફક્ત ગુજરાતીમાં જ જવાબ આપવાનો છે. અંગ્રjીમaં નહीं." },
};

const SARVAM_LANG_CODES = {
  "en-US": "en-IN", "en": "en-IN",
  "hi-IN": "hi-IN", "hi": "hi-IN",
  "mr-IN": "mr-IN", "mr": "mr-IN",
  "ta-IN": "ta-IN", "ta": "ta-IN",
  "te-IN": "te-IN", "te": "te-IN",
  "bn-BD": "bn-IN", "bn": "bn-IN",
  "gu-IN": "gu-IN", "gu": "gu-IN",
};

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

1. CROP INTELLIGENCE
- AI crop recommendations based on soil, season, location, mandi demand
- Pest & disease identification with treatment options (organic + chemical)
- Soil health, fertilizer dosage, irrigation scheduling
- Weather impact on sowing/harvesting windows

2. MARKET INTELLIGENCE & FAIR PRICING
- Current mandi rates across nearby APMCs
- Walk-away price recommendation so farmer never undersells
- Alert when buyer offer is below fair market: "This offer is X% below current rate"
- Which buyers are purchasing right now in farmer's area

3. INPUT MARKETPLACE
- Verified seed, fertilizer, pesticide vendors with fair price benchmarks
- Bulk buying recommendations to reduce input cost
- Quality guidance and reviews

4. LIVING PRODUCT PASSPORT (QR TRACKING)
- Explain the crop's digital passport journey
- Show every handoff: farm → aggregator → cold storage → buyer
- Full margin transparency — what each middleman earns

5. RURAL CREDIT SCORE
- Explain GramOS credit score (based on deliveries, quality ratings, payment history)
- Tips to improve score for loan access
- Microfinance and KCC loan guidance

6. GOVERNMENT SCHEMES
- PM-Kisan eligibility and application steps
- PMFBY crop insurance enrollment
- Kisan Credit Card (KCC) guidance
- State-specific schemes based on profile
- Document checklists in simple language

7. WORKFORCE
- Post harvest jobs to nearby villagers
- Fair wage benchmarks by region and crop type

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
4. If commodity missing: answer for top 5 high-volume vegetables (tomato, onion, potato, chilli, leafy greens).
5. If quantity missing: answer for both small (100kg-1T) and bulk (5T+) scenarios briefly.
6. If location missing: give major procurement hubs (Azadpur Delhi, APMC Vashi Mumbai, KR Market Bangalore) as reference points.
7. If timeline missing: assume immediate procurement need.

CORE CAPABILITIES:

1. SUPPLIER DISCOVERY & PROCUREMENT
- Find verified farmers by crop type, quality grade, location, available quantity
- Bulk order optimization combining multiple farmers
- Seasonal availability forecasting (2-3 months ahead)
- Reliable supplier shortlisting based on delivery ratings

2. PRODUCT PASSPORT & QUALITY VERIFICATION
- Interpret QR product passports — full farm-to-retailer journey
- Verify quality certifications, pesticide usage, handling records
- Identify supply chain margins at each handoff
- Flag any broken chain of custody

3. PRICING & NEGOTIATION INTELLIGENCE
- Real-time mandi benchmarks for fair procurement
- Platform flags exploitative offers to farmers automatically
- Demand-supply signals: crop surplus vs shortage right now
- Price trend alerts: when to buy before prices spike

4. INVENTORY & STOCK MANAGEMENT
- Low stock alerts and reorder triggers
- Cold storage availability and logistics routing
- Wastage reduction for perishables

5. FARMER NETWORK BUILDING
- Build verified supplier base on GramOS
- Contract farming arrangement guidance
- Farmer credit scores to assess reliability

6. COMPLIANCE
- FSSAI quality standards for fresh produce
- AGMARK labeling and grading
- Import/export documentation

PERSONALITY: Business-focused, data-driven, efficient. Lead with the most actionable insight.
RESPONSE LENGTH: Under 150 words. Use numbered lists for multi-step processes.`,

  villager: (langInstruction) => `You are AgriBot — the livelihood assistant of GramOS, India's rural economic operating system.

⚠️ ABSOLUTE LANGUAGE RULE: ${langInstruction} This rule overrides everything else. Never switch languages.

YOUR ROLE: You serve RURAL VILLAGERS. You are their job finder, skill coach, and income guide.

MISSING CONTEXT PROTOCOL — CRITICAL:
When the user does NOT mention location, skill level, crop type, or availability, you MUST NOT ask upfront or say you cannot help. Instead:
1. Give a USEFUL answer assuming a general rural Indian villager — unskilled to semi-skilled, available for field work, located in a major agricultural state (UP, Maharashtra, Punjab, MP, or AP).
2. At the END, add one soft follow-up: "Tell me your village/district — I can find jobs closest to you."
3. NEVER say "I need your location." Always give actionable info first.
4. If skill is missing: answer for general harvest labour (most common need).
5. If location missing: list top job-available regions for that season.
6. If season/timing missing: use current Indian agricultural calendar to infer the active harvest window.
7. If wage expectation missing: give the standard MGNREGS floor + market premium range for context.

CORE CAPABILITIES:

1. JOB DISCOVERY & MATCHING
- Find harvest and farm jobs by location and skills
- Show pay rates, duration, crop type, and farmer ratings
- Seasonal work calendar: sowing, weeding, harvesting windows
- Best-fit jobs ranked by proximity and skill match

2. SKILL DEVELOPMENT ACADEMY
- Guide through 5-minute vernacular micro-skill modules
- Topics: drip irrigation, organic farming, post-harvest handling, cold chain, tractor operation, pesticide safety
- How each module adds a skill badge to profile
- How badges lead to better jobs and higher wages

3. VERIFIED WORK HISTORY (GIG PROFILE)
- How QR check-ins at farms build verified work history
- Villager with 20+ verified harvests earns "Trusted Villager" badge
- Why this profile matters for future jobs on and off platform

4. INCOME & PAYMENT TRACKING
- Track all gig earnings in one place
- Payment timelines and dispute resolution
- Income history for rural credit score and loan applications

5. SAFETY & EQUIPMENT
- Safe equipment handling: tractors, sprayers, harvesters
- Pesticide safety: PPE requirements, dosage, waiting periods
- Heat stress and field safety during peak summer
- First aid for common field injuries

6. FINANCIAL INCLUSION
- How work history builds rural credit score on GramOS
- Jan Dhan account for direct payment
- PMJJBY life insurance and PMSBY accident insurance
- MGNREGS wage support during off-season

PERSONALITY: Supportive, encouraging, clear. Speak simply like a trusted elder who wants villagers to succeed. Never condescending.
RESPONSE LENGTH: Under 120 words. Use numbered steps. Avoid complex vocabulary.`,

  consumer: (langInstruction) => `You are AgriBot — the fresh produce companion of GramOS, India's rural economic operating system.

⚠️ ABSOLUTE LANGUAGE RULE: ${langInstruction} This rule overrides everything else. Never switch languages.

YOUR ROLE: You serve CONSUMERS. Help them find the freshest produce, understand what they're buying, and connect with farmers.

MISSING CONTEXT PROTOCOL — CRITICAL:
When the user does NOT mention location, budget, dietary preference, or specific produce, you MUST NOT ask for it first or say you cannot help. Instead:
1. Give a USEFUL answer based on what is commonly in season across India right now, assuming an urban or semi-urban consumer.
2. At the END, add one soft follow-up: "Let me know your city — I can find farmers and markets near you!"
3. NEVER say "I need your location to answer." Always give useful general info first.
4. If produce is missing: recommend top 3 seasonal picks currently available across India.
5. If location missing: give pan-India availability with metro market references (Delhi, Mumbai, Bangalore, Chennai, Hyderabad).
6. If budget missing: give options across ₹20–50/kg (regular), ₹50–100/kg (premium), and organic tiers.
7. If dietary preference missing: assume vegetarian (most common in Indian consumer context).

CORE CAPABILITIES:

1. FRESH PRODUCE DISCOVERY
- Find seasonal fruits, vegetables, grains, dairy by location
- Compare prices across nearby farmers and mandis
- What's in peak season right now for best quality and value
- Farm-to-home distance and freshness indicator

2. PRODUCT PASSPORT (QR SCANNING)
- What QR on packaging reveals: farm origin, soil type, inputs used
- Pesticide records and waiting period compliance
- Every handoff from farm to doorstep with timestamps

3. QUALITY & FRESHNESS GUIDANCE
- How to identify fresh vs old produce by look, smell, feel
- Grade A vs B, AGMARK certification explained practically
- Organic vs conventional: real differences and price justification
- Post-harvest handling: what good cold chain looks like

4. DIRECT FARMER CONNECTION
- How to buy directly from verified farmers on GramOS marketplace
- Benefits: fresher food, better price, trust
- How to leave quality ratings that help farmers

5. NUTRITION & RECIPES
- Nutritional benefits of seasonal produce
- Simple recipe suggestions for specific vegetables or grains
- Storage tips to maximize freshness at home
- Preservation and pickling for excess produce

6. SEASONAL AWARENESS
- Month-wise crop availability for Indian regions
- Why buying in-season is cheaper and fresher
- Upcoming seasonal produce arriving in next 2-4 weeks

PERSONALITY: Warm, friendly, enthusiastic about good food. Speak like a knowledgeable friend at a farmers market.
RESPONSE LENGTH: Under 130 words. Be conversational. Suggest follow-up questions naturally.`,
};

const ROLE_META = {
  farmer:   { label: "Farmer",   emoji: "🌾", color: "#15803d", bg: "#dcfce7", greet: 'Ready to help you grow better and earn more 💪\n\nTry asking:\n• "Best crop this season in my area?"\n• "Current tomato mandi rates"\n• "Am I eligible for PM-Kisan?"' },
  retailer: { label: "Retailer", emoji: "🏪", color: "#1d4ed8", bg: "#dbeafe", greet: 'Your procurement intelligence engine is live 📊\n\nTry asking:\n• "Find tomato suppliers near Mumbai"\n• "When will onion prices peak?"\n• "How do I verify QR product passport?"' },
  villager: { label: "Villager", emoji: "🏡", color: "#92400e", bg: "#fef3c7", greet: 'Find work, build skills, earn more — I\'ve got you 🤝\n\nTry asking:\n• "Harvest jobs near Nashik"\n• "How do I earn skill badges?"\n• "When is rice harvest season?"' },
  consumer: { label: "Consumer", emoji: "🛒", color: "#7c3aed", bg: "#ede9fe", greet: 'Let\'s find the freshest produce near you! 🥦\n\nTry asking:\n• "What vegetables are in season now?"\n• "Find organic farmers near me"\n• "What does the QR on my vegetables mean?"' },
};

// ─── TTS ENGINE ───────────────────────────────────────────────────────────────
// Audio cache: langCode+text → base64 string (caps at 30 entries, LRU-ish)
const ttsCache = new Map();
const TTS_CACHE_MAX = 30;

function cleanForTTS(text) {
  return text
    .replace(/[*_~`#•\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 500); // Keep shorter = faster Sarvam response
}

async function fetchTTSAudio(text, sarvamLang, apiKey, signal) {
  const cacheKey = `${sarvamLang}::${text}`;
  if (ttsCache.has(cacheKey)) return ttsCache.get(cacheKey);

  const res = await fetch("https://api.sarvam.ai/text-to-speech", {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-subscription-key": apiKey },
    body: JSON.stringify({ text, target_language_code: sarvamLang, model: "bulbul:v3" }),
    signal,
  });

  if (!res.ok) throw new Error(`Sarvam ${res.status}`);
  const data = await res.json();
  const b64 = data.audios?.[0];
  if (!b64) throw new Error("No audio");

  // LRU eviction
  if (ttsCache.size >= TTS_CACHE_MAX) {
    ttsCache.delete(ttsCache.keys().next().value);
  }
  ttsCache.set(cacheKey, b64);
  return b64;
}

// ─── SOCKET (singleton outside component) ────────────────────────────────────
const socket = io(import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || "http://localhost:8000");

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function Chatbot() {
  const { t, currentLanguage: pageLang } = useTranslation();
  const navigate = useNavigate();

  const [userRole, setUserRole]   = useState("consumer");
  const [lang, setLang]           = useState(() => LANGUAGES_MAP[pageLang] || LANGUAGES_MAP["en"]);
  const [messages, setMessages]   = useState([]);
  const [history, setHistory]     = useState([]);
  const [input, setInput]         = useState("");
  const [minimized, setMinimized] = useState(true);
  const [typing, setTyping]       = useState(false);
  const [listening, setListening] = useState(false);
  const [muted, setMuted]         = useState(false);
  const [chatImage, setChatImage] = useState(null);

  // refs — never trigger re-renders
  const audioRef          = useRef(null);
  const abortRef          = useRef(null);   // AbortController for in-flight TTS fetch
  const playGenRef        = useRef(0);      // generation counter → cancels stale plays
  const chatRef           = useRef(null);
  const recogRef          = useRef(null);
  const textareaRef       = useRef(null);
  const lastAttachedImage = useRef(null);
  const activeCallSid     = useRef(null);
  const sendMessageFnRef  = useRef(null);
  const langRef           = useRef(lang);
  const mutedRef          = useRef(muted);

  // keep refs in sync without extra renders
  useEffect(() => { langRef.current  = lang;  }, [lang]);
  useEffect(() => { mutedRef.current = muted; }, [muted]);

  // ── load role ──────────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const u    = JSON.parse(localStorage.getItem("user") || "{}");
      const role = (u.role || u.userRole || "consumer").toLowerCase();
      if (ROLE_META[role]) setUserRole(role);
    } catch {}
  }, []);

  // ── greeting on open ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!minimized && messages.length === 0) {
      const meta = ROLE_META[userRole] || ROLE_META.consumer;
      setMessages([{ role: "bot", text: `${t("chatbot.greeting")}\n\n${meta.greet}`, id: Date.now() }]);
    }
  }, [minimized]); // eslint-disable-line

  // ── sync lang with page ────────────────────────────────────────────────────
  useEffect(() => {
    const matched = LANGUAGES_MAP[pageLang];
    if (matched) setLang(matched);
  }, [pageLang]);

  // ── re-greet on role change ────────────────────────────────────────────────
  useEffect(() => {
    if (!minimized) {
      const meta = ROLE_META[userRole] || ROLE_META.consumer;
      setMessages([{ role: "bot", text: `${t("chatbot.greeting")}\n\n${meta.greet}`, id: Date.now() }]);
      setHistory([]);
    }
  }, [userRole]); // eslint-disable-line

  // ── auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, typing]);

  // ── TTS: stop any playing audio & cancel in-flight fetch ──────────────────
  const stopSpeaking = useCallback(() => {
    playGenRef.current++;
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
  }, []);

  // ── TTS: play a bot message ────────────────────────────────────────────────
  const playMessageAudio = useCallback(async (msg) => {
    const apiKey = import.meta.env.VITE_SARVAM_API_KEY;
    if (!apiKey || !msg?.text) return;

    stopSpeaking();
    const gen        = playGenRef.current;
    const clean      = cleanForTTS(msg.text);
    if (!clean) return;

    const sarvamLang = SARVAM_LANG_CODES[langRef.current.code] || "en-IN";

    // Abort controller so we can cancel the fetch if needed
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const b64 = await fetchTTSAudio(clean, sarvamLang, apiKey, controller.signal);
      if (playGenRef.current !== gen) return; // cancelled

      const audio      = new Audio(`data:audio/mp3;base64,${b64}`);
      audioRef.current = audio;
      audio.onended = audio.onerror = () => { audioRef.current = null; };
      audio.play();
    } catch (err) {
      if (err.name !== "AbortError") console.error("Sarvam TTS:", err);
    }
  }, [stopSpeaking]);

  // ── TTS: toggle mute ───────────────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    setMuted(prev => {
      if (!prev) stopSpeaking(); // muting → stop current audio
      return !prev;
    });
  }, [stopSpeaking]);

  // ── Speech recognition setup ───────────────────────────────────────────────
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r       = new SR();
    r.continuous      = false;
    r.interimResults  = false;
    r.lang            = lang.code;
    r.onresult        = (e) => { setListening(false); sendMessageFnRef.current?.(e.results[0][0].transcript); };
    r.onerror         = () => setListening(false);
    r.onend           = () => setListening(false);
    recogRef.current  = r;
    return () => r.stop();
  }, [lang]);

  const startListening = useCallback(() => {
    if (!recogRef.current || listening) return;
    stopSpeaking();
    recogRef.current.lang = langRef.current.code;
    try { recogRef.current.start(); setListening(true); } catch {}
  }, [listening, stopSpeaking]);

  const stopListening = useCallback(() => {
    if (!recogRef.current || !listening) return;
    recogRef.current.stop(); setListening(false);
  }, [listening]);

  // ── OpenRouter tool definitions (stable — never changes) ──────────────────
  const tools = useMemo(() => [
    {
      type: "function",
      function: {
        name: "execute_platform_action",
        description: "Execute a platform UI interaction like navigating to a dashboard page, opening a modal, or logging out.",
        parameters: {
          type: "object",
          properties: {
            actionType: { type: "string", description: "Allowed: 'navigate_section', 'navigate_url', 'open_modal', 'logout'." },
            target: { type: "string", description: "Section name, URL path, or modal name depending on actionType." },
          },
          required: ["actionType"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "add_farmer_produce",
        description: "Add a new crop to the farmer's inventory. ONLY call when user gives crop name, quantity (kg), base price (₹), and locality.",
        parameters: {
          type: "object",
          properties: {
            name:      { type: "string" },
            type:      { type: "string", description: "One of: Vegetable, Fruit, Grain, Leafy Greens, Pulse, Spice, Dairy, Other" },
            quantity:  { type: "number" },
            basePrice: { type: "number" },
            locality:  { type: "string" },
          },
          required: ["name", "type", "quantity", "basePrice", "locality"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "update_user_profile",
        description: "Update user profile settings. Use when user asks to change name, phone, location, bio, crops, or language.",
        parameters: {
          type: "object",
          properties: {
            updates: { type: "object", additionalProperties: { type: "string" } },
          },
          required: ["updates"],
        },
      },
    },
  ], []);

  // ── Main send handler ──────────────────────────────────────────────────────
  const sendMessageFn = useCallback(async (voiceText) => {
    const text         = (voiceText !== undefined ? voiceText : input).trim();
    const currentImage = chatImage;
    if ((!text && !currentImage) || typing) return;

    if (voiceText === undefined) setInput("");
    if (currentImage) lastAttachedImage.current = currentImage;
    setChatImage(null);

    const userMsg = { role: "user", text: text || t("chatbot.uploadedImage"), id: Date.now() };
    if (currentImage) userMsg.image = URL.createObjectURL(currentImage);
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);
    stopSpeaking();

    const currentLang = langRef.current;
    const basePrompt  = (ROLE_PROMPTS[userRole] || ROLE_PROMPTS.consumer)(currentLang.instruction);
    const systemPrompt = basePrompt + "\n\n🚨 AGENTIC CAPABILITIES 🚨\nYou are now a FULLY AGENTIC AI. You have tools available to control the GramOS platform UI. If the user asks to navigate somewhere, view something, open their profile, logout, or check a specific dashboard section, you MUST use the `execute_platform_action` tool to do it for them! When you execute an action using the tool, also provide a helpful natural language response. NEVER say you can't do it, just use the tool!";
    const updatedHistory = [...history, { role: "user", content: text }];

    // ── Pre-fetch TTS in parallel with LLM call ────────────────────────────
    // We can't pre-fetch reply text yet, but we warm the connection.
    // The actual speed gain: we start TTS fetch the instant we have reply text,
    // before setMessages re-render, so playback begins ~300ms sooner.

    try {
      const res  = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
          tools,
        }),
      });

      const data    = await res.json();
      const message = data.choices?.[0]?.message;
      let reply     = message?.content || "";

      // ── Handle tool calls ────────────────────────────────────────────────
      if (message?.tool_calls?.length) {
        for (const toolCall of message.tool_calls) {
          const { name, arguments: rawArgs } = toolCall.function;

          try {
            const args = JSON.parse(rawArgs);

            if (name === "execute_platform_action") {
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

            } else if (name === "add_farmer_produce") {
              const user = JSON.parse(localStorage.getItem("user") || "{}");
              if (!user?.email) {
                reply += (reply ? "\n\n" : "") + `⚠️ I couldn't automatically add the crop. Please log in first.`;
                continue;
              }

              const typeMap = { Vegetables: "Vegetable", Fruits: "Fruit", Grains: "Grain", Pulses: "Pulse", Spices: "Spice" };
              const safeType        = typeMap[args.type] || args.type || "Other";
              const validatedName   = (args.name     || "").trim();
              const validatedLoc    = (args.locality  || "").trim();
              const validatedQty    = Number(args.quantity)  || 0;
              const validatedPrice  = Number(args.basePrice) || 0;

              if (!validatedName || !validatedLoc || validatedQty <= 0 || validatedPrice <= 0) {
                reply += (reply ? "\n\n" : "") + `⚠️ I need crop name, quantity, price, and locality to add produce. Please provide all details!`;
                continue;
              }

              const formData = new FormData();
              formData.append("name",        validatedName);
              formData.append("type",        safeType);
              formData.append("quantity",    validatedQty);
              formData.append("basePrice",   validatedPrice);
              formData.append("locality",    validatedLoc);
              formData.append("farmerEmail", user.email);
              if (lastAttachedImage.current) {
                formData.append("image", lastAttachedImage.current);
                lastAttachedImage.current = null;
              }

              try {
                await axios.post(import.meta.env.VITE_API_BASE_URL + "/products", formData);
                window.dispatchEvent(new CustomEvent("AGRIBOT_PRODUCE_ADDED"));
                reply += (reply ? "\n\n" : "") + `✅ Added ${validatedQty}kg of ${validatedName} from ${validatedLoc} at ₹${validatedPrice}/kg to your inventory!`;
              } catch {
                reply += (reply ? "\n\n" : "") + `❌ Tried to add your crop but hit a system error. Check your connection.`;
              }

            } else if (name === "update_user_profile") {
              window.dispatchEvent(new CustomEvent("AGRIBOT_UPDATE_PROFILE", { detail: args.updates }));
              reply += (reply ? "\n\n" : "") + `✅ Profile updated!`;
            }
          } catch (e) {
            console.error("Tool parse error:", name, e);
          }
        }
      }

      if (!reply) reply = t("chatbot.actionExecuted");

      const botMsgId = Date.now() + 1;

      // ── Fire TTS fetch IMMEDIATELY (before state updates) ─────────────────
      // This hides ~200-300ms of React re-render latency from the user's
      // perceived TTS start time.
      let ttsPromise = null;
      if (!mutedRef.current && import.meta.env.VITE_SARVAM_API_KEY) {
        const clean      = cleanForTTS(reply);
        const sarvamLang = SARVAM_LANG_CODES[currentLang.code] || "en-IN";
        const controller = new AbortController();
        abortRef.current = controller;
        const gen        = ++playGenRef.current;

        ttsPromise = fetchTTSAudio(clean, sarvamLang, import.meta.env.VITE_SARVAM_API_KEY, controller.signal)
          .then(b64 => {
            if (playGenRef.current !== gen) return;
            if (audioRef.current) { audioRef.current.pause(); }
            const audio      = new Audio(`data:audio/mp3;base64,${b64}`);
            audioRef.current = audio;
            audio.onended = audio.onerror = () => { audioRef.current = null; };
            audio.play();
          })
          .catch(err => { if (err.name !== "AbortError") console.error("TTS:", err); });
      }

      setMessages(prev => [...prev, { role: "bot", text: reply, id: botMsgId }]);
      setHistory([...updatedHistory, { role: "assistant", content: reply }]);

      // Twilio reply
      if (activeCallSid.current) {
        axios.post(import.meta.env.VITE_API_BASE_URL + "/voice/reply", {
          callSid: activeCallSid.current,
          text: reply.substring(0, 1000),
        }).catch(err => console.error("Twilio reply:", err));
        activeCallSid.current = null;
      }

      await ttsPromise; // just ensures any errors are caught, doesn't block UI
    } catch {
      setMessages(prev => [...prev, { role: "bot", text: t("chatbot.connectionError"), id: Date.now() + 1 }]);
    } finally {
      setTyping(false);
    }
  }, [input, typing, history, userRole, chatImage, tools, stopSpeaking, navigate, t]);

  useEffect(() => { sendMessageFnRef.current = sendMessageFn; }, [sendMessageFn]);

  // ── Twilio socket ──────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = ({ callSid, text }) => {
      if (minimized) setMinimized(false);
      activeCallSid.current = callSid;
      setTimeout(() => sendMessageFnRef.current?.(text), 100);
    };
    socket.on("twilio_speech", handler);
    return () => socket.off("twilio_speech", handler);
  }, [minimized]);

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => () => { stopSpeaking(); }, [stopSpeaking]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const clearChat = useCallback(() => {
    stopSpeaking();
    setHistory([]);
    const meta = ROLE_META[userRole] || ROLE_META.consumer;
    setMessages([{ role: "bot", text: `${t("chatbot.chatCleared")}\n\n${meta.greet}`, id: Date.now() }]);
  }, [stopSpeaking, userRole, t]);

  const handleKey = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessageFn(); }
  }, [sendMessageFn]);

  const meta = ROLE_META[userRole] || ROLE_META.consumer;

  // ── MINIMIZED ─────────────────────────────────────────────────────────────
  if (minimized) {
    return (
      <>
        <style>{`
          @keyframes agri-ping { 0% { transform:scale(1);opacity:.5; } 70%,100% { transform:scale(1.45);opacity:0; } }
          @keyframes agri-pop  { 0% { transform:scale(.4);opacity:0; } 70% { transform:scale(1.1); } 100% { transform:scale(1);opacity:1; } }
        `}</style>
        <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999 }}>
          <div style={{ position:"absolute", inset:-8, borderRadius:"50%", border:"2px solid #16a34a", opacity:.5, animation:"agri-ping 2.2s ease-out infinite", pointerEvents:"none" }} />
          <button
            onClick={() => setMinimized(false)}
            style={{ width:62, height:62, borderRadius:"50%", background:"linear-gradient(145deg,#16a34a,#14532d)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 6px 24px rgba(21,128,61,.5)", animation:"agri-pop .4s ease" }}
            onMouseOver={e => { e.currentTarget.style.transform="scale(1.1)"; e.currentTarget.style.boxShadow="0 8px 30px rgba(21,128,61,.6)"; }}
            onMouseOut={e  => { e.currentTarget.style.transform="scale(1)";   e.currentTarget.style.boxShadow="0 6px 24px rgba(21,128,61,.5)"; }}
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
        @keyframes agri-slide-up { from{opacity:0;transform:translateY(20px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes agri-msg-in   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes agri-blink    { 0%,100%{opacity:1} 50%{opacity:.25} }
        @keyframes agri-dot      { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
        .agri-msg { animation:agri-msg-in .22s ease; }
        .agri-scrollbar::-webkit-scrollbar { width:3px; }
        .agri-scrollbar::-webkit-scrollbar-thumb { background:rgba(22,163,74,.2);border-radius:4px; }
        .agri-input:focus { outline:none;border-color:#16a34a!important;box-shadow:0 0 0 3px rgba(22,163,74,.12)!important; }
        .agri-icon-btn:hover { background:rgba(255,255,255,.18)!important; }
      `}</style>

      <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999, width:390, height:590, borderRadius:22, boxShadow:"0 24px 64px rgba(0,0,0,.16),0 4px 16px rgba(0,0,0,.08)", display:"flex", flexDirection:"column", overflow:"hidden", background:"#fff", fontFamily:"'Segoe UI',-apple-system,system-ui,sans-serif", animation:"agri-slide-up .3s cubic-bezier(.34,1.56,.64,1)" }}>

        {/* ─ HEADER ─ */}
        <div style={{ background:"linear-gradient(135deg,#14532d 0%,#166534 55%,#15803d 100%)", padding:"14px 14px 10px", position:"relative", overflow:"hidden", flexShrink:0 }}>
          {[{w:90,h:90,t:-30,l:-15,op:.07},{w:60,h:60,t:10,l:90,op:.06},{w:40,h:40,b:-10,r:80,op:.09}].map((c,i) => (
            <div key={i} style={{ position:"absolute", width:c.w, height:c.h, borderRadius:"50%", background:"#fff", opacity:c.op, top:c.t, left:c.l, bottom:c.b, right:c.r, pointerEvents:"none" }} />
          ))}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", position:"relative" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:42, height:42, borderRadius:"50%", background:"rgba(255,255,255,.14)", border:"1.5px solid rgba(255,255,255,.28)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <GiWheat style={{ fontSize:24, color:"#fff" }} />
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:5 }}>
              {listening && (
                <span style={{ fontSize:10, color:"#fca5a5", display:"flex", alignItems:"center", gap:3, fontWeight:600 }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:"#f87171", animation:"agri-blink .7s infinite" }} />
                  {t("chatbot.listening")}
                </span>
              )}
              <button onClick={toggleMute} className="agri-icon-btn" title={muted ? t("chatbot.voiceOn") : t("chatbot.voiceOff")} style={{ width:30, height:30, borderRadius:8, border:"none", background:muted?"rgba(239,68,68,.2)":"rgba(74,222,128,.2)", outline:muted?"1px solid #ef4444":"1px solid #4ade80", cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", transition:"all .2s" }}>
                {muted ? "🔇" : "🔊"}
              </button>
              <button onClick={clearChat} className="agri-icon-btn" style={{ width:30, height:30, borderRadius:8, border:"none", background:"rgba(255,255,255,.1)", outline:"1px solid rgba(255,255,255,.18)", cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", transition:"all .2s" }}>🗑️</button>
              <button onClick={() => setMinimized(true)} className="agri-icon-btn" style={{ width:30, height:30, borderRadius:8, border:"none", background:"rgba(255,255,255,.1)", outline:"1px solid rgba(255,255,255,.18)", cursor:"pointer", fontSize:14, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", transition:"all .2s" }}>✕</button>
            </div>
          </div>
        </div>

        {/* ─ MESSAGES ─ */}
        <div ref={chatRef} className="agri-scrollbar" style={{ flex:1, overflowY:"auto", padding:"14px 12px", background:"linear-gradient(175deg,#f0fdf4 0%,#fff 55%)", display:"flex", flexDirection:"column", gap:8 }}>
          {messages.map(msg => (
            <div key={msg.id} className="agri-msg" style={{ display:"flex", justifyContent:msg.role==="user"?"flex-end":"flex-start" }}>
              {msg.role === "bot" && (
                <div style={{ width:30, height:30, borderRadius:"50%", background:"linear-gradient(135deg,#15803d,#14532d)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginRight:7, marginTop:2 }}>
                  <GiWheat style={{ fontSize:15, color:"#fff" }} />
                </div>
              )}
              <div style={{ maxWidth:"78%", padding:msg.role==="user"?"9px 13px":"9px 28px 9px 13px", borderRadius:msg.role==="user"?"18px 18px 4px 18px":"4px 18px 18px 18px", background:msg.role==="user"?"linear-gradient(135deg,#16a34a,#15803d)":"#fff", color:msg.role==="user"?"#fff":"#111", fontSize:13.5, lineHeight:1.6, whiteSpace:"pre-wrap", wordBreak:"break-word", border:msg.role==="bot"?"1px solid #d1fae5":"none", boxShadow:msg.role==="bot"?"0 1px 5px rgba(0,0,0,.05)":"0 2px 10px rgba(22,163,74,.22)", position:"relative" }}>
                {msg.role === "bot" && (
                  <button onClick={() => playMessageAudio(msg)} style={{ position:"absolute", top:2, right:2, width:22, height:22, borderRadius:"50%", border:"none", background:"#f0fdf4", cursor:"pointer", fontSize:11, display:"flex", alignItems:"center", justifyContent:"center", padding:0, opacity:.6, transition:"opacity .2s", boxShadow:"0 1px 3px rgba(0,0,0,.1)", zIndex:1 }} onMouseOver={e=>e.currentTarget.style.opacity=.9} onMouseOut={e=>e.currentTarget.style.opacity=.6} title="Listen">🔊</button>
                )}
                {msg.image && <img src={msg.image} alt="user upload" style={{ width:"100%", borderRadius:8, marginBottom:6, maxHeight:150, objectFit:"cover" }} />}
                {msg.text}
              </div>
            </div>
          ))}

          {typing && (
            <div className="agri-msg" style={{ display:"flex", alignItems:"flex-end", gap:7 }}>
              <div style={{ width:30, height:30, borderRadius:"50%", background:"linear-gradient(135deg,#15803d,#14532d)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <GiWheat style={{ fontSize:15, color:"#fff" }} />
              </div>
              <div style={{ background:"#fff", border:"1px solid #d1fae5", borderRadius:"4px 18px 18px 18px", padding:"11px 16px", display:"flex", gap:5, boxShadow:"0 1px 5px rgba(0,0,0,.05)" }}>
                {[0, 0.18, 0.36].map((d,i) => (
                  <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:"#16a34a", animation:`agri-dot 1.1s ${d}s ease-in-out infinite` }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─ INPUT ─ */}
        <div style={{ padding:"8px 12px 12px", borderTop:"1px solid #dcfce7", background:"#fff", flexShrink:0 }}>
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
              style={{ flex:1, resize:"none", padding:"9px 13px", border:"1.5px solid #d1fae5", borderRadius:14, fontSize:13.5, fontFamily:"inherit", background:"#fafafa", color:"#111", lineHeight:1.5, maxHeight:88, overflowY:"auto", transition:"border-color .2s,box-shadow .2s" }}
            />
            <button onClick={() => listening ? stopListening() : startListening()} disabled={typing} title={listening ? t("chatbot.stop") : t("chatbot.voiceWithLanguage", { language: lang.name })} style={{ width:40, height:40, borderRadius:12, flexShrink:0, border:"none", background:listening?"#ef4444":"#f0fdf4", outline:listening?"none":"1.5px solid #bbf7d0", cursor:"pointer", fontSize:17, display:"flex", alignItems:"center", justifyContent:"center", transition:"all .2s", animation:listening?"agri-blink .7s infinite":"none", boxShadow:listening?"0 2px 10px rgba(239,68,68,.35)":"none", color:"#16a34a" }}>🎤</button>
            <label style={{ width:40, height:40, borderRadius:12, flexShrink:0, background:"#f0fdf4", outline:"1.5px solid #bbf7d0", cursor:"pointer", fontSize:17, display:"flex", alignItems:"center", justifyContent:"center", transition:"all .2s" }} title={t("chatbot.attachPhoto")}>
              <input type="file" accept="image/*" style={{ display:"none" }} onChange={e => { if (e.target.files[0]) setChatImage(e.target.files[0]); }} />
              📎
            </label>
            <button onClick={() => sendMessageFn()} disabled={(!input.trim() && !chatImage) || typing} style={{ width:40, height:40, borderRadius:12, flexShrink:0, border:"none", background:(input.trim()||chatImage)&&!typing?"linear-gradient(135deg,#16a34a,#14532d)":"#e5e7eb", cursor:(input.trim()||chatImage)&&!typing?"pointer":"not-allowed", fontSize:19, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", transition:"all .2s", boxShadow:(input.trim()||chatImage)&&!typing?"0 3px 12px rgba(22,163,74,.35)":"none" }}>↑</button>
          </div>
        </div>
      </div>
    </>
  );
}
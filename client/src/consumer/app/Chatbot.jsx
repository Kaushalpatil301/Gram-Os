import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GiWheat } from "react-icons/gi";
import { io } from "socket.io-client";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const MODEL = "openai/gpt-4o-mini"; 

// ─── LANGUAGES ───────────────────────────────────────────────────────────────
const LANGUAGES = [
  {
    code: "en-US",
    name: "English",
    flag: "🇺🇸",
    voiceLang: "en-US",
    instruction:
      "You MUST reply strictly in English only. Do not use any other language.",
  },
  {
    code: "hi-IN",
    name: "हिन्दी",
    flag: "🇮🇳",
    voiceLang: "hi-IN",
    instruction:
      "आपको केवल और केवल हिंदी में जवाब देना है। कोई भी अंग्रेजी शब्द या वाक्य मत लिखो।",
  },
  {
    code: "mr-IN",
    name: "मराठी",
    flag: "🇮🇳",
    voiceLang: "mr-IN",
    instruction:
      "तुम्ही फक्त मराठीत उत्तर द्यायला हवे. एकही इंग्रजी शब्द वापरू नका.",
  },
  {
    code: "ta-IN",
    name: "தமிழ்",
    flag: "🇮🇳",
    voiceLang: "ta-IN",
    instruction:
      "நீங்கள் கண்டிப்பாக தமிழில் மட்டும் பதில் சொல்லவேண்டும். ஆங்கிலம் பயன்படுத்தாதீர்கள்.",
  },
  {
    code: "te-IN",
    name: "తెలుగు",
    flag: "🇮🇳",
    voiceLang: "te-IN",
    instruction:
      "మీరు తప్పనిసరిగా తెలుగులో మాత్రమే సమాధానం ఇవ్వాలి. ఆంగ్లం వాడకూడదు.",
  },
  {
    code: "bn-BD",
    name: "বাংলা",
    flag: "🇧🇩",
    voiceLang: "bn-BD",
    instruction:
      "আপনাকে অবশ্যই শুধুমাত্র বাংলায় উত্তর দিতে হবে। ইংরেজি ব্যবহার করা যাবে না।",
  },
  {
    code: "kn-IN",
    name: "ಕನ್ನಡ",
    flag: "🇮🇳",
    voiceLang: "kn-IN",
    instruction:
      "ನೀವು ಕಡ್ಡಾಯವಾಗಿ ಕನ್ನಡದಲ್ಲಿ ಮಾತ್ರ ಉತ್ತರ ನೀಡಬೇಕು. ಇಂಗ್ಲಿಷ್ ಬಳಸಬಾರದು.",
  },
  {
    code: "pa-IN",
    name: "ਪੰਜਾਬੀ",
    flag: "🇮🇳",
    voiceLang: "pa-IN",
    instruction: "ਤੁਹਾਨੂੰ ਸਿਰਫ਼ ਪੰਜਾਬੀ ਵਿੱਚ ਜਵਾਬ ਦੇਣਾ ਹੈ। ਕੋਈ ਅੰਗਰੇਜ਼ੀ ਨਹੀਂ।",
  },
  {
    code: "es-ES",
    name: "Español",
    flag: "🇪🇸",
    voiceLang: "es-ES",
    instruction:
      "DEBES responder ÚNICAMENTE en español. Ninguna palabra en inglés.",
  },
  {
    code: "fr-FR",
    name: "Français",
    flag: "🇫🇷",
    voiceLang: "fr-FR",
    instruction:
      "Tu DOIS répondre UNIQUEMENT en français. Aucun mot en anglais.",
  },
];

// ─── ROLE SYSTEM PROMPTS ─────────────────────────────────────────────────────
const ROLE_PROMPTS = {
  farmer: (
    langInstruction,
  ) => `You are AgriBot — the intelligent assistant of GramOS, India's rural economic operating system.

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
- Post harvest jobs to nearby workers
- Fair wage benchmarks by region and crop type

PERSONALITY: Direct, practical, confident — like a mentor who has farmed his whole life but understands markets too. No jargon. Always actionable.
RESPONSE LENGTH: Under 150 words unless farmer asks for detailed steps. Use line breaks.`,

  retailer: (
    langInstruction,
  ) => `You are AgriBot — the supply chain intelligence assistant of GramOS, India's rural economic operating system.

⚠️ ABSOLUTE LANGUAGE RULE: ${langInstruction} This rule overrides everything else. Never switch languages.

YOUR ROLE: You serve RETAILERS and BUYERS. You are their procurement advisor, supplier discovery engine, and quality intelligence system.

MISSING CONTEXT PROTOCOL — CRITICAL:
When the user does NOT mention location, commodity, quantity, budget, or timeline, you MUST NOT ask for it upfront or refuse to answer. Instead:
1. Give a USEFUL answer using the most common Indian retail/procurement scenario as default (e.e., wholesale buyer near a metro, procuring common vegetables, 1-5 tonne lots).
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

  worker: (
    langInstruction,
  ) => `You are AgriBot — the livelihood assistant of GramOS, India's rural economic operating system.

⚠️ ABSOLUTE LANGUAGE RULE: ${langInstruction} This rule overrides everything else. Never switch languages.

YOUR ROLE: You serve RURAL WORKERS. You are their job finder, skill coach, and income guide.

MISSING CONTEXT PROTOCOL — CRITICAL:
When the user does NOT mention location, skill level, crop type, or availability, you MUST NOT ask upfront or say you cannot help. Instead:
1. Give a USEFUL answer assuming a general rural Indian worker — unskilled to semi-skilled, available for field work, located in a major agricultural state (UP, Maharashtra, Punjab, MP, or AP).
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
- Worker with 20+ verified harvests earns "Trusted Worker" badge
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

PERSONALITY: Supportive, encouraging, clear. Speak simply like a trusted elder who wants workers to succeed. Never condescending.
RESPONSE LENGTH: Under 120 words. Use numbered steps. Avoid complex vocabulary.`,

  consumer: (
    langInstruction,
  ) => `You are AgriBot — the fresh produce companion of GramOS, India's rural economic operating system.

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

// ─── ROLE META ────────────────────────────────────────────────────────────────
const ROLE_META = {
  farmer: {
    label: "Farmer",
    emoji: "🌾",
    color: "#15803d",
    bg: "#dcfce7",
    greet:
      'Ready to help you grow better and earn more 💪\n\nTry asking:\n• "Best crop this season in my area?"\n• "Current tomato mandi rates"\n• "Am I eligible for PM-Kisan?"',
  },
  retailer: {
    label: "Retailer",
    emoji: "🏪",
    color: "#1d4ed8",
    bg: "#dbeafe",
    greet:
      'Your procurement intelligence engine is live 📊\n\nTry asking:\n• "Find tomato suppliers near Mumbai"\n• "When will onion prices peak?"\n• "How do I verify QR product passport?"',
  },
  worker: {
    label: "Worker",
    emoji: "👷",
    color: "#92400e",
    bg: "#fef3c7",
    greet:
      'Find work, build skills, earn more — I\'ve got you 🤝\n\nTry asking:\n• "Harvest jobs near Nashik"\n• "How do I earn skill badges?"\n• "When is rice harvest season?"',
  },
  consumer: {
    label: "Consumer",
    emoji: "🛒",
    color: "#7c3aed",
    bg: "#ede9fe",
    greet:
      'Let\'s find the freshest produce near you! 🥦\n\nTry asking:\n• "What vegetables are in season now?"\n• "Find organic farmers near me"\n• "What does the QR on my vegetables mean?"',
  },
};

// ─── VOICE SYNTHESIS ──────────────────────────────────────────────────────────
function speakText(text, langCode, onEnd) {
  if (!window.speechSynthesis) {
    onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  const clean = text
    .replace(/[*_~`#•\-]/g, " ")
    .replace(/\s+/g, " ")
    .substring(0, 500);
  const utter = new SpeechSynthesisUtterance(clean);
  utter.lang = langCode;
  utter.rate = 0.95;
  utter.pitch = 1.05;
  utter.onend = () => onEnd?.();
  utter.onerror = () => onEnd?.();
  const setVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    const langPrefix = langCode.split("-")[0];
    const match =
      voices.find((v) => v.lang === langCode) ||
      voices.find((v) => v.lang.startsWith(langPrefix));
    if (match) utter.voice = match;
    window.speechSynthesis.speak(utter);
  };
  if (window.speechSynthesis.getVoices().length) setVoice();
  else {
    window.speechSynthesis.onvoiceschanged = setVoice;
  }
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────
const socket = io("http://localhost:8000");

export default function Chatbot() {
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
  const recogRef = useRef(null);
  const textareaRef = useRef(null);
  const lastAttachedImage = useRef(null);
  const activeCallSid = useRef(null);

  // removed twilio socket link from here  // load role from localStorage
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      const role = (u.role || u.userRole || "consumer").toLowerCase();
      if (ROLE_META[role]) setUserRole(role);
    } catch {}
  }, []);

  // greeting on open
  useEffect(() => {
    if (!minimized && messages.length === 0) {
      const meta = ROLE_META[userRole] || ROLE_META.consumer;
      setMessages([
        {
          role: "bot",
          text: `Namaste! I'm AgriBot 🌾\n\n${meta.greet}`,
          id: Date.now(),
        },
      ]);
    }
  }, [minimized]);

  // re-greet if role changes while open
  useEffect(() => {
    if (!minimized) {
      const meta = ROLE_META[userRole] || ROLE_META.consumer;
      setMessages([
        {
          role: "bot",
          text: `Namaste! I'm AgriBot 🌾\n\n${meta.greet}`,
          id: Date.now(),
        },
      ]);
      setHistory([]);
    }
  }, [userRole]);

  // auto-scroll
  useEffect(() => {
    if (chatRef.current)
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, typing]);

  // voices
  useEffect(() => {
    window.speechSynthesis?.getVoices();
  }, []);

  // speech recognition
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.continuous = false;
    r.interimResults = false;
    r.lang = lang.code;
    r.onresult = (e) => {
      const t = e.results[0][0].transcript;
      setListening(false);
      sendMessageFn(t);
    };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    recogRef.current = r;
  }, [lang]);

  const toggleMic = () => {
    if (!recogRef.current) return;
    if (listening) {
      recogRef.current.stop();
      return;
    }
    recogRef.current.lang = lang.code;
    try {
      recogRef.current.start();
      setListening(true);
    } catch {}
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  };

  const sendMessageFn = useCallback(
    async (voiceText) => {
      const text = (voiceText !== undefined ? voiceText : input).trim();
      const currentImage = chatImage; // Capture immediately

      // Allow sending if there's either text or an uploaded image
      if ((!text && !currentImage) || typing) return;

      if (voiceText === undefined) setInput("");

      // Update persistent ref
      if (currentImage) {
        lastAttachedImage.current = currentImage;
      }
      setChatImage(null); // Clear from UI immediately

      // Add user message to UI
      const userMsg = {
        role: "user",
        text: text || "Uploaded an image",
        id: Date.now(),
      };
      if (currentImage) {
        userMsg.image = URL.createObjectURL(currentImage);
      }
      setMessages((prev) => [...prev, userMsg]);
      setTyping(true);
      stopSpeaking();

      const basePrompt = (ROLE_PROMPTS[userRole] || ROLE_PROMPTS.consumer)(
        lang.instruction,
      );
      const systemPrompt =
        basePrompt +
        "\n\n🚨 AGENTIC CAPABILITIES 🚨\nYou are now a FULLY AGENTIC AI. You have tools available to control the GramOS platform UI. If the user asks to navigate somewhere, view something, open their profile, logout, or check a specific dashboard section, you MUST use the `execute_platform_action` tool to do it for them! When you execute an action using the tool, also provide a helpful natural language response. NEVER say you can't do it, just use the tool!";
      const updatedHistory = [...history, { role: "user", content: text }];

      try {
        const res = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
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
              messages: [
                { role: "system", content: systemPrompt },
                ...updatedHistory,
              ],
              tools: [
                {
                  type: "function",
                  function: {
                    name: "execute_platform_action",
                    description:
                      "Execute a platform UI interaction like navigating to a dashboard page, opening a modal, or logging out. Use this proactively when the user tells you to do something in the UI, such as viewing schemes, logging out, checking produce, exploring markets, or adding a product. Provide a response back to the user indicating you are taking action.",
                    parameters: {
                      type: "object",
                      properties: {
                        actionType: {
                          type: "string",
                          description:
                            "The type of action to perform. Allowed values: 'navigate_section', 'navigate_url', 'open_modal', 'logout'.",
                        },
                        target: {
                          type: "string",
                          description:
                            "The parameter for the action. For 'navigate_section', MUST be one of: 'marketplace', 'produce', 'workforce', 'scanner', 'map', 'credit', 'schemes' (for Farmers), OR 'jobs', 'academy', 'nptel', 'earnings', 'alert' (for Workers), OR 'browse', 'analytics', 'network', 'contracts', 'qr' (for Retailers). For 'navigate_url', provide a path (e.g. '/dashboard/farmer', '/dashboard/worker', '/dashboard/consumer', '/dashboard/retailer'). For 'open_modal', MUST be one of: 'profile', 'scan', 'add_produce'.",
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
                      "Automatically add a new product or crop to the farmer's inventory on their behalf. ONLY call this when the user explicitly provides crop name, quantity (in kg), base price (in rs), and locality/city.",
                    parameters: {
                      type: "object",
                      properties: {
                        name: {
                          type: "string",
                          description:
                            "Name of the produce/crop (e.g. Tomato, Onions)",
                        },
                        type: {
                          type: "string",
                          description:
                            "Must be exactly one of: 'Vegetable', 'Fruit', 'Grain', 'Leafy Greens', 'Pulse', 'Spice', 'Dairy', 'Other'. Default to 'Other' if unsure.",
                        },
                        quantity: {
                          type: "number",
                          description: "Quantity in kg",
                        },
                        basePrice: {
                          type: "number",
                          description: "Base price per kg in Indian Rupees",
                        },
                        locality: {
                          type: "string",
                          description: "City or location of harvest",
                        },
                      },
                      required: [
                        "name",
                        "type",
                        "quantity",
                        "basePrice",
                        "locality",
                      ],
                    },
                  },
                },
                {
                  type: "function",
                  function: {
                    name: "update_user_profile",
                    description:
                      "Automatically update the user's profile settings (Farmer or Worker). Use this when the user asks to change their location, name, phone, bio, crops, or language.",
                    parameters: {
                      type: "object",
                      properties: {
                        updates: {
                          type: "object",
                          description:
                            "Key-value pairs of the fields to update. Valid keys: 'name', 'phone', 'location', 'bio', 'language', 'crops', 'specialization', 'village'.",
                          additionalProperties: { type: "string" },
                        },
                      },
                      required: ["updates"],
                    },
                  },
                },
              ],
            }),
          },
        );

        const data = await res.json();
        const message = data.choices?.[0]?.message;

        let reply = message?.content || "";

        // Handle Agentic Tool Calls
        if (message?.tool_calls && message.tool_calls.length > 0) {
          for (const toolCall of message.tool_calls) {
            if (toolCall.function.name === "execute_platform_action") {
              try {
                const args = JSON.parse(toolCall.function.arguments);
                console.log("Agent Executing Tool:", args);

                if (args.actionType === "navigate_section") {
                  window.dispatchEvent(
                    new CustomEvent("AGRIBOT_NAVIGATE", {
                      detail: { section: args.target },
                    }),
                  );
                  reply +=
                    (reply ? "\n\n" : "") +
                    `Navigating to ${args.target} section...`;
                } else if (args.actionType === "open_modal") {
                  window.dispatchEvent(
                    new CustomEvent("AGRIBOT_MODAL", {
                      detail: { modal: args.target },
                    }),
                  );
                  reply += (reply ? "\n\n" : "") + `Opening ${args.target}...`;
                } else if (args.actionType === "navigate_url") {
                  navigate(args.target);
                  reply +=
                    (reply ? "\n\n" : "") + `Navigating to ${args.target}...`;
                } else if (args.actionType === "logout") {
                  window.dispatchEvent(
                    new CustomEvent("AGRIBOT_ACTION", {
                      detail: { action: "logout" },
                    }),
                  );
                  reply += (reply ? "\n\n" : "") + `Logging out...`;
                }
              } catch (e) {
                console.error("Failed to parse tool call args", e);
              }
            } else if (toolCall.function.name === "add_farmer_produce") {
              try {
                const args = JSON.parse(toolCall.function.arguments);
                console.log("Agent Executing Tool:", args);
                const user = JSON.parse(localStorage.getItem("user") || "{}");

                if (user?.email) {
                  let safeType = (args.type || "Other").trim();
                  if (safeType === "Vegetables") safeType = "Vegetable";
                  if (safeType === "Fruits") safeType = "Fruit";
                  if (safeType === "Grains") safeType = "Grain";
                  if (safeType === "Pulses") safeType = "Pulse";
                  if (safeType === "Spices") safeType = "Spice";

                  const validatedName = (args.name || "").trim();
                  const validatedLocality = (args.locality || "").trim();
                  const validatedQty = Number(args.quantity) || 0;
                  const validatedPrice = Number(args.basePrice) || 0;

                  if (
                    !validatedName ||
                    !validatedLocality ||
                    validatedQty <= 0 ||
                    validatedPrice <= 0
                  ) {
                    reply +=
                      (reply ? "\n\n" : "") +
                      `⚠️ I couldn't add the crop because I need more details. Please ensure you provide the **crop name, quantity, price**, and **locality**!`;
                    throw new Error("Validation skipped");
                  }

                  const formData = new FormData();
                  formData.append("name", validatedName);
                  formData.append("type", safeType);
                  formData.append("quantity", validatedQty);
                  formData.append("basePrice", validatedPrice);
                  formData.append("locality", validatedLocality);
                  formData.append("farmerEmail", user.email);

                  // Inject image if one was attached in the current or previous message!
                  if (lastAttachedImage.current) {
                    formData.append("image", lastAttachedImage.current);
                    lastAttachedImage.current = null; // Consume it
                  }

                  try {
                    await axios.post(
                      "http://localhost:8000/api/v1/products",
                      formData,
                    );
                    window.dispatchEvent(
                      new CustomEvent("AGRIBOT_PRODUCE_ADDED"),
                    );
                    reply +=
                      (reply ? "\n\n" : "") +
                      `✅ I have automatically added ${validatedQty}kg of ${validatedName} from ${validatedLocality} at ₹${validatedPrice}/kg to your inventory!`;
                  } catch (err) {
                    if (err.message !== "Validation skipped") {
                      reply +=
                        (reply ? "\n\n" : "") +
                        `❌ I tried to add your produce, but encountered a system error. Please check your connection.`;
                    }
                  }
                } else {
                  reply +=
                    (reply ? "\n\n" : "") +
                    `⚠️ I couldn't automatically add the crop. Please log in first.`;
                }
              } catch (e) {
                console.error("Failed to parse add_farmer_produce args", e);
              }
            } else if (toolCall.function.name === "update_user_profile") {
              try {
                const args = JSON.parse(toolCall.function.arguments);
                window.dispatchEvent(
                  new CustomEvent("AGRIBOT_UPDATE_PROFILE", {
                    detail: args.updates,
                  }),
                );
                reply +=
                  (reply ? "\n\n" : "") +
                  `✅ I've updated your profile settings with the new details!`;
              } catch (e) {
                console.error("Failed to parse update_user_profile args", e);
              }
            }
          }
        }

        if (!reply) {
          reply = "Action executed!";
        }

        setMessages((prev) => [
          ...prev,
          { role: "bot", text: reply, id: Date.now() + 1 },
        ]);
        setHistory([...updatedHistory, { role: "assistant", content: reply }]);

        // Reply to Twilio phone caller if this was triggered by a voice call
        if (activeCallSid.current) {
          axios
            .post("http://localhost:8000/api/v1/voice/reply", {
              callSid: activeCallSid.current,
              text: reply.substring(0, 1000), // Keep it short enough for TwiML
            })
            .catch((err) => console.error("Twilio reply error:", err));
          activeCallSid.current = null;
        }

        if (voiceOn) {
          setSpeaking(true);
          speakText(reply, lang.voiceLang, () => setSpeaking(false));
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            text: "❌ Connection error. Check your API key and internet.",
            id: Date.now() + 1,
          },
        ]);
      } finally {
        setTyping(false);
      }
    },
    [input, typing, history, lang, userRole, voiceOn, chatImage],
  );

  // twilio socket link
  useEffect(() => {
    const handleTwilioSpeech = ({ callSid, text }) => {
      console.log("Receiving twilio speech:", text, "callSid:", callSid);
      if (!minimized) {
        // Auto-open if minimized could be done, but let's just ensure it's logged
      } else {
        setMinimized(false);
      }
      activeCallSid.current = callSid;
      // Wrap in setTimeout to ensure state is clean and minimized=false applies
      setTimeout(() => sendMessageFn(text), 100);
    };

    socket.on("twilio_speech", handleTwilioSpeech);
    return () => {
      socket.off("twilio_speech", handleTwilioSpeech);
    };
  }, [minimized, sendMessageFn]);

  const clearChat = () => {
    stopSpeaking();
    setHistory([]);
    const meta = ROLE_META[userRole] || ROLE_META.consumer;
    setMessages([
      {
        role: "bot",
        text: `Chat cleared! Still here.\n\n${meta.greet}`,
        id: Date.now(),
      },
    ]);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessageFn();
    }
  };

  const meta = ROLE_META[userRole] || ROLE_META.consumer;

  const QUICK = {
    farmer: [
      "Best crop this season?",
      "Mandi rates today",
      "PM-Kisan eligibility",
    ],
    retailer: [
      "Find tomato suppliers",
      "Price trend alert",
      "Verify QR passport",
    ],
    worker: ["Harvest jobs near me", "Earn skill badges", "My income history"],
    consumer: [
      "Seasonal veggies now",
      "Find local farmers",
      "What's in my QR?",
    ],
  };

  // ── MINIMIZED ────────────────────────────────────────────────────────────────
  if (minimized) {
    return (
      <>
        <style>{`
          @keyframes agri-ping {
            0%   { transform: scale(1);    opacity: 0.5; }
            70%  { transform: scale(1.45); opacity: 0; }
            100% { transform: scale(1.45); opacity: 0; }
          }
          @keyframes agri-pop {
            0%   { transform: scale(0.4); opacity: 0; }
            70%  { transform: scale(1.1); }
            100% { transform: scale(1);   opacity: 1; }
          }
        `}</style>
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}>
          <div
            style={{
              position: "absolute",
              inset: -8,
              borderRadius: "50%",
              border: "2px solid #16a34a",
              opacity: 0.5,
              animation: "agri-ping 2.2s ease-out infinite",
              pointerEvents: "none",
            }}
          />
          <button
            onClick={() => setMinimized(false)}
            style={{
              width: 62,
              height: 62,
              borderRadius: "50%",
              background: "linear-gradient(145deg, #16a34a, #14532d)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 24px rgba(21,128,61,0.5)",
              animation: "agri-pop 0.4s ease",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.boxShadow =
                "0 8px 30px rgba(21,128,61,0.6)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow =
                "0 6px 24px rgba(21,128,61,0.5)";
            }}
          >
            <GiWheat style={{ fontSize: 30, color: "#fff" }} />
          </button>
          <div
            style={{
              position: "absolute",
              bottom: -1,
              right: -1,
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: meta.bg,
              border: `2px solid ${meta.color}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              pointerEvents: "none",
            }}
          >
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
        @keyframes agri-slide-up {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes agri-msg-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes agri-blink {
          0%, 100% { opacity: 1; } 50% { opacity: 0.25; }
        }
        @keyframes agri-dot {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        @keyframes agri-wave {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1.5); }
        }
        .agri-msg { animation: agri-msg-in 0.22s ease; }
        .agri-scrollbar::-webkit-scrollbar { width: 3px; }
        .agri-scrollbar::-webkit-scrollbar-thumb { background: rgba(22,163,74,0.2); border-radius: 4px; }
        .agri-input:focus { outline: none; border-color: #16a34a !important; box-shadow: 0 0 0 3px rgba(22,163,74,0.12) !important; }
        .agri-chip:hover { background: #d1fae5 !important; }
        .agri-icon-btn:hover { background: rgba(255,255,255,0.18) !important; }
      `}</style>

      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          width: 390,
          height: 590,
          borderRadius: 22,
          boxShadow:
            "0 24px 64px rgba(0,0,0,0.16), 0 4px 16px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "#fff",
          fontFamily: "'Segoe UI', -apple-system, system-ui, sans-serif",
          animation: "agri-slide-up 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* ─ HEADER ─ */}
        <div
          style={{
            background:
              "linear-gradient(135deg, #14532d 0%, #166534 55%, #15803d 100%)",
            padding: "14px 14px 10px",
            position: "relative",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {/* Decorative circles */}
          {[
            { w: 90, h: 90, t: -30, l: -15, op: 0.07 },
            { w: 60, h: 60, t: 10, l: 90, op: 0.06 },
            { w: 40, h: 40, b: -10, r: 80, op: 0.09 },
          ].map((c, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: c.w,
                height: c.h,
                borderRadius: "50%",
                background: "#fff",
                opacity: c.op,
                top: c.t,
                left: c.l,
                bottom: c.b,
                right: c.r,
                pointerEvents: "none",
              }}
            />
          ))}

          {/* Title row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              position: "relative",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.14)",
                  border: "1.5px solid rgba(255,255,255,0.28)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <GiWheat style={{ fontSize: 24, color: "#fff" }} />
              </div>
              <div>
                <div
                  style={{
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 16,
                    letterSpacing: 0.2,
                  }}
                >
                  AgriBot
                </div>
                <div style={{ color: "#86efac", fontSize: 11 }}>
                  GramOS · Rural Economic OS
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              {speaking && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    marginRight: 2,
                  }}
                >
                  {[0, 0.12, 0.24, 0.12, 0].map((d, i) => (
                    <div
                      key={i}
                      style={{
                        width: 3,
                        height: 14,
                        background: "#4ade80",
                        borderRadius: 3,
                        animation: `agri-wave 0.65s ${d}s ease-in-out infinite`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Voice toggle */}
              <button
                onClick={() => {
                  const next = !voiceOn;
                  setVoiceOn(next);
                  if (!next) stopSpeaking();
                }}
                className="agri-icon-btn"
                title={voiceOn ? "Voice on" : "Voice off"}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  border: "none",
                  background: voiceOn
                    ? "rgba(74,222,128,0.22)"
                    : "rgba(255,255,255,0.1)",
                  outline: voiceOn
                    ? "1.5px solid #4ade80"
                    : "1px solid rgba(255,255,255,0.18)",
                  cursor: "pointer",
                  fontSize: 15,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
              >
                {voiceOn ? "🔊" : "🔇"}
              </button>

              {/* Clear */}
              <button
                onClick={clearChat}
                className="agri-icon-btn"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  border: "none",
                  background: "rgba(255,255,255,0.1)",
                  outline: "1px solid rgba(255,255,255,0.18)",
                  cursor: "pointer",
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
              >
                🗑️
              </button>

              {/* Close */}
              <button
                onClick={() => setMinimized(true)}
                className="agri-icon-btn"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  border: "none",
                  background: "rgba(255,255,255,0.1)",
                  outline: "1px solid rgba(255,255,255,0.18)",
                  cursor: "pointer",
                  fontSize: 14,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Role + Language row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 9,
              position: "relative",
            }}
          >
            <span
              style={{
                background: meta.bg,
                color: meta.color,
                fontSize: 11,
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: 20,
                border: `1px solid ${meta.color}35`,
                letterSpacing: 0.2,
              }}
            >
              {meta.emoji} {meta.label}
            </span>

            <select
              value={lang.code}
              onChange={(e) => {
                const l = LANGUAGES.find((x) => x.code === e.target.value);
                if (l) setLang(l);
              }}
              disabled={listening}
              style={{
                fontSize: 11,
                fontWeight: 600,
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.22)",
                borderRadius: 20,
                padding: "3px 10px",
                color: "#fff",
                cursor: "pointer",
                outline: "none",
              }}
            >
              {LANGUAGES.map((l) => (
                <option
                  key={l.code}
                  value={l.code}
                  style={{ color: "#111", background: "#fff" }}
                >
                  {l.flag} {l.name}
                </option>
              ))}
            </select>

            {listening && (
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 11,
                  color: "#fca5a5",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#f87171",
                    animation: "agri-blink 0.7s infinite",
                  }}
                />
                Listening…
              </span>
            )}
          </div>
        </div>

        {/* ─ MESSAGES ─ */}
        <div
          ref={chatRef}
          className="agri-scrollbar"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "14px 12px",
            background: "linear-gradient(175deg, #f0fdf4 0%, #fff 55%)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="agri-msg"
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              {msg.role === "bot" && (
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #15803d, #14532d)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginRight: 7,
                    marginTop: 2,
                  }}
                >
                  <GiWheat style={{ fontSize: 15, color: "#fff" }} />
                </div>
              )}
              <div
                style={{
                  maxWidth: "78%",
                  padding: "9px 13px",
                  borderRadius:
                    msg.role === "user"
                      ? "18px 18px 4px 18px"
                      : "4px 18px 18px 18px",
                  background:
                    msg.role === "user"
                      ? "linear-gradient(135deg, #16a34a, #15803d)"
                      : "#fff",
                  color: msg.role === "user" ? "#fff" : "#111",
                  fontSize: 13.5,
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  border: msg.role === "bot" ? "1px solid #d1fae5" : "none",
                  boxShadow:
                    msg.role === "bot"
                      ? "0 1px 5px rgba(0,0,0,0.05)"
                      : "0 2px 10px rgba(22,163,74,0.22)",
                }}
              >
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="user upload"
                    style={{
                      width: "100%",
                      borderRadius: 8,
                      marginBottom: 6,
                      maxHeight: 150,
                      objectFit: "cover",
                    }}
                  />
                )}
                {msg.text}
              </div>
            </div>
          ))}

          {typing && (
            <div
              className="agri-msg"
              style={{ display: "flex", alignItems: "flex-end", gap: 7 }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #15803d, #14532d)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <GiWheat style={{ fontSize: 15, color: "#fff" }} />
              </div>
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #d1fae5",
                  borderRadius: "4px 18px 18px 18px",
                  padding: "11px 16px",
                  display: "flex",
                  gap: 5,
                  boxShadow: "0 1px 5px rgba(0,0,0,0.05)",
                }}
              >
                {[0, 0.18, 0.36].map((d, i) => (
                  <div
                    key={i}
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "#16a34a",
                      animation: `agri-dot 1.1s ${d}s ease-in-out infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─ INPUT AREA ─ */}
        <div
          style={{
            padding: "8px 12px 12px",
            borderTop: "1px solid #dcfce7",
            background: "#fff",
            flexShrink: 0,
          }}
        >
          {/* Quick chips */}
          <div
            style={{
              display: "flex",
              gap: 5,
              marginBottom: 8,
              overflowX: "auto",
              paddingBottom: 1,
            }}
          >
            {(QUICK[userRole] || QUICK.consumer).map((q) => (
              <button
                key={q}
                onClick={() => sendMessageFn(q)}
                className="agri-chip"
                style={{
                  whiteSpace: "nowrap",
                  fontSize: 11,
                  fontWeight: 500,
                  padding: "4px 10px",
                  borderRadius: 20,
                  border: "1px solid #bbf7d0",
                  background: "#f0fdf4",
                  color: "#15803d",
                  cursor: "pointer",
                  flexShrink: 0,
                  transition: "background 0.15s",
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Image Attachment Preview */}
          {chatImage && (
            <div
              style={{
                position: "relative",
                marginBottom: 8,
                display: "inline-block",
              }}
            >
              <img
                src={URL.createObjectURL(chatImage)}
                alt="preview"
                style={{
                  height: 48,
                  borderRadius: 8,
                  border: "2px solid #16a34a",
                  objectFit: "cover",
                }}
              />
              <button
                onClick={() => setChatImage(null)}
                style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: 18,
                  height: 18,
                  fontSize: 10,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>
          )}

          <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 88) + "px";
              }}
              onKeyDown={handleKey}
              rows={1}
              placeholder={`Message in ${lang.name}…`}
              disabled={typing}
              className="agri-input agri-scrollbar"
              style={{
                flex: 1,
                resize: "none",
                padding: "9px 13px",
                border: "1.5px solid #d1fae5",
                borderRadius: 14,
                fontSize: 13.5,
                fontFamily: "inherit",
                background: "#fafafa",
                color: "#111",
                lineHeight: 1.5,
                maxHeight: 88,
                overflowY: "auto",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
            />

            {/* Mic */}
            <button
              onClick={toggleMic}
              disabled={typing}
              title={listening ? "Stop" : `Voice (${lang.name})`}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                flexShrink: 0,
                border: "none",
                background: listening ? "#ef4444" : "#f0fdf4",
                outline: listening ? "none" : "1.5px solid #bbf7d0",
                cursor: "pointer",
                fontSize: 17,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
                animation: listening ? "agri-blink 0.7s infinite" : "none",
                boxShadow: listening
                  ? "0 2px 10px rgba(239,68,68,0.35)"
                  : "none",
                color: "#16a34a",
              }}
            >
              🎤
            </button>

            {/* Attachment */}
            <label
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                flexShrink: 0,
                background: "#f0fdf4",
                outline: "1.5px solid #bbf7d0",
                cursor: "pointer",
                fontSize: 17,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
              title="Attach Photo"
            >
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  if (e.target.files[0]) setChatImage(e.target.files[0]);
                }}
              />
              📎
            </label>

            {/* Send */}
            <button
              onClick={() => sendMessageFn()}
              disabled={(!input.trim() && !chatImage) || typing}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                flexShrink: 0,
                border: "none",
                background:
                  (input.trim() || chatImage) && !typing
                    ? "linear-gradient(135deg, #16a34a, #14532d)"
                    : "#e5e7eb",
                cursor:
                  (input.trim() || chatImage) && !typing
                    ? "pointer"
                    : "not-allowed",
                fontSize: 19,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
                boxShadow:
                  (input.trim() || chatImage) && !typing
                    ? "0 3px 12px rgba(22,163,74,0.35)"
                    : "none",
              }}
            >
              ↑
            </button>
          </div>

          <div
            style={{
              textAlign: "center",
              fontSize: 10,
              color: "#9ca3af",
              marginTop: 6,
            }}
          >
            GramOS AgriBot · Replies in {lang.name} · Powered by OpenRouter
          </div>
        </div>
      </div>
    </>
  );
}

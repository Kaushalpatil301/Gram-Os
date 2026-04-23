import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import productRouter from "./routes/product.routes.js";
import inventoryRouter from "./routes/inventory.routes.js";
import loanRouter from "./routes/loan.routes.js";
import profileRouter from "./routes/profile.routes.js";
import jobRouter from "./routes/job.routes.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type", "X-Requested-With"],
  }),
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/inventory", inventoryRouter);
app.use("/api/v1/loans", loanRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/jobs", jobRouter);

import twilio from "twilio";

// Store active calls to send a reply back when UI answers
const activeCalls = new Map();

// Initial hit from Twilio when phone call is answered
app.post("/voice", (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  // Using generic Indian accent for English. 
  // Instructs user and gathers speech.
  const gather = twiml.gather({
    input: 'speech',
    action: '/voice/process',
    language: 'en-IN',
    speechTimeout: 'auto',
    timeout: 3,
  });
  gather.say({ language: 'en-IN' }, "Namaste. Welcome to Gram O S. How can AgriBot help you today?");
  
  res.type('text/xml');
  res.send(twiml.toString());
});

// Process the speech result and forward to UI
app.post("/voice/process", (req, res) => {
  const speech = req.body.SpeechResult;
  const callSid = req.body.CallSid;
  
  console.log("🗣️ Twilio Call Speech received:", speech);

  const twiml = new twilio.twiml.VoiceResponse();
  if (!speech) {
    // If no speech detected, fallback
    twiml.say({ language: 'en-IN' }, "I didn't hear anything. Let's try again.");
    twiml.redirect({ method: "POST" }, "/voice");
    res.type('text/xml');
    return res.send(twiml.toString());
  }

  // Broadcast to frontend socket for the Chatbot to pick up
  const io = req.app.get("io");
  if (io) {
    io.emit("twilio_speech", { callSid, text: speech });
  }

  // Hold the Twilio HTTP request connection open for up to 12s waiting for UI bot
  const timeoutId = setTimeout(() => {
    if (activeCalls.has(callSid)) {
      activeCalls.delete(callSid);
      twiml.say({ language: 'en-IN' }, "Processing. Please check your screen for the result.");
      res.type('text/xml');
      res.send(twiml.toString());
    }
  }, 12000); // 12 seconds
  
  activeCalls.set(callSid, { res, timeoutId });
});

// The UI will call this to speak back to the phone caller
app.post("/api/v1/voice/reply", (req, res) => {
  const { callSid, text } = req.body;
  if (activeCalls.has(callSid)) {
    const { res: twilioRes, timeoutId } = activeCalls.get(callSid);
    clearTimeout(timeoutId);
    activeCalls.delete(callSid);
    
    // Send response back to Twilio caller
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say({ language: 'en-IN' }, text);
    // Optionally you could add another gather here to keep dialogue open, but let's keep it simple
    
    twilioRes.type('text/xml');
    twilioRes.send(twiml.toString());
  }
  res.json({ success: true });
});

app.get("/", (req, res) => {
  res.send("Welcome to my Project");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

export default app;

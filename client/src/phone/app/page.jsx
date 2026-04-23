import React, { useState, useRef, useEffect } from "react";
import { Phone, PhoneOff, Mic, Send, Loader2, Volume2, User, Sprout } from "lucide-react";
import axios from "axios";

export default function PhoneSimulation() {
  const [callState, setCallState] = useState("idle"); // idle, calling, connected
  const [role, setRole] = useState("farmer");
  const [inputText, setInputText] = useState("");
  const [logs, setLogs] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [listening, setListening] = useState(false);
  
  const recogRef = useRef(null);
  const currentCallSid = useRef(null);
  
  const roles = [
    { id: "farmer", name: "Farmer Hotline", number: "+91 99999-FARM", color: "bg-emerald-500" },
    { id: "retailer", name: "Retailer Helpline", number: "+91 88888-SHOP", color: "bg-blue-500" },
    { id: "worker", name: "Labour Assistance", number: "+91 77777-WORK", color: "bg-amber-500" },
    { id: "consumer", name: "Consumer Support", number: "+91 66666-FOOD", color: "bg-purple-500" }
  ];
  
  const activeRole = roles.find(r => r.id === role);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.continuous = false;
    r.interimResults = false;
    r.lang = 'en-IN';
    r.onresult = (e) => {
      const t = e.results[0][0].transcript;
      setInputText(t);
      setListening(false);
    };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    recogRef.current = r;
  }, []);

  const toggleMic = () => {
    if (!recogRef.current) {
        alert("Speech recognition not supported in this browser.");
        return;
    }
    if (listening) {
      recogRef.current.stop();
      return;
    }
    try {
      recogRef.current.start();
      setListening(true);
    } catch {}
  };

  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-IN";
    utter.rate = 0.95;
    window.speechSynthesis.speak(utter);
  };

  const startCall = () => {
    setCallState("calling");
    setLogs([]);
    setTimeout(() => {
      setCallState("connected");
      currentCallSid.current = "sim_" + Date.now();
      
      const welcomeMsg = `Namaste. Welcome to Gram O S ${activeRole.name}. How can AgriBot help you today?`;
      addLog("agent", welcomeMsg);
      speakText(welcomeMsg);
    }, 2000);
  };

  const endCall = () => {
    setCallState("idle");
    addLog("system", "Call ended");
    window.speechSynthesis?.cancel();
    currentCallSid.current = null;
  };

  const addLog = (speaker, text) => {
    setLogs(prev => [...prev, { id: Date.now(), speaker, text, time: new Date() }]);
  };

  const simulateSpeech = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isProcessing || callState !== "connected") return;

    const speech = inputText.trim();
    setInputText("");
    addLog("user", speech);
    setIsProcessing(true);

    try {
        // Send request to backend simulating Twilio
        const res = await axios.post("http://localhost:8000/voice/process", {
            SpeechResult: speech,
            CallSid: currentCallSid.current
        });
        
        let twiml = res.data;
        // Parse TwiML XML to find the text inside <Say>
        let replyText = "I could not understand.";
        const match = twiml.match(/<Say[^>]*>(.*?)<\/Say>/s);
        if (match && match[1]) {
            replyText = match[1];
        }
        
        addLog("agent", replyText);
        speakText(replyText);
        
    } catch (err) {
        console.error("Simulation error", err);
        addLog("system", "Connection to backend failed");
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      {/* Phone Frame */}
      <div className="w-full max-w-[380px] h-[800px] bg-black rounded-[50px] shadow-2xl relative overflow-hidden ring-4 ring-gray-800 p-2 flex flex-col">
        {/* Notch */}
        <div className="absolute top-0 inset-x-0 h-6 flex justify-center">
          <div className="w-32 h-6 bg-black rounded-b-xl"></div>
        </div>

        {/* Screen Background */}
        <div className="flex-1 bg-gradient-to-b from-gray-800 to-gray-900 rounded-[40px] overflow-hidden flex flex-col pt-10">
          
          {/* Header */}
          <div className="px-6 py-4 flex flex-col items-center">
            <div className="p-3 bg-gray-800 rounded-full mb-3 shrink-0">
               <Sprout className="w-8 h-8 text-emerald-400" />
            </div>
            {callState === "idle" ? (
                <>
                    <h2 className="text-2xl font-bold text-white mb-2">Simulate Call</h2>
                    <p className="text-gray-400 text-sm text-center mb-6">Test your Agentic Webhooks locally without a real phone.</p>
                    
                    <div className="w-full space-y-3">
                        {roles.map(r => (
                            <button
                                key={r.id}
                                onClick={() => setRole(r.id)}
                                className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all ${role === r.id ? 'bg-gray-700 ring-2 ring-emerald-500' : 'bg-gray-800 hover:bg-gray-750'}`}
                            >
                                <div className="text-left">
                                    <div className="text-white font-medium">{r.name}</div>
                                    <div className="text-emerald-400 text-xs mt-1">{r.number}</div>
                                </div>
                                <div className={`w-3 h-3 rounded-full ${r.color}`}></div>
                            </button>
                        ))}
                    </div>
                </>
            ) : (
                <>
                    <div className="text-gray-400 font-medium mb-1">{activeRole.name}</div>
                    <div className="text-3xl text-white font-light mb-1">
                        {callState === "calling" ? "Calling..." : "00:00"}
                    </div>
                    {isProcessing && <div className="flex items-center text-xs text-amber-400 animate-pulse mt-1"><Loader2 className="w-3 h-3 animate-spin mr-1"/> Processing Task...</div>}
                </>
            )}
          </div>

          {/* Connected Call UI */}
          {callState === "connected" && (
              <div className="flex-1 flex flex-col justify-end px-4 pb-6 overflow-hidden">
                  
                  {/* Logs */}
                  <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2 scrollbar-hide">
                     {logs.map(log => (
                         <div key={log.id} className={`flex flex-col ${log.speaker === "user" ? "items-end" : "items-start"}`}>
                             <div className="text-[10px] text-gray-500 mb-1 px-1 uppercase">{log.speaker}</div>
                             <div className={`p-3 rounded-2xl text-sm max-w-[85%] ${
                                 log.speaker === "user" ? "bg-emerald-600 text-white rounded-br-sm" : 
                                 log.speaker === "system" ? "bg-gray-800 text-gray-400 text-xs italic" :
                                 "bg-gray-700 text-white rounded-bl-sm"
                             }`}>
                                 {log.text}
                             </div>
                         </div>
                     ))}
                  </div>

                  {/* Input Simulation */}
                  <form onSubmit={simulateSpeech} className="relative mt-auto">
                      <div className="absolute -top-10 left-0 right-0 flex justify-center pb-2">
                         <span className="text-xs text-gray-400 bg-gray-800/80 px-3 py-1 rounded-full">Pro Tip: Keep the Dashboard open in another window!</span>
                      </div>
                      <div className="flex gap-2">
                          <button 
                            type="button" 
                            onClick={toggleMic}
                            className={`p-3 rounded-xl shrink-0 transition-colors ${listening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                          >
                              <Mic className="w-5 h-5" />
                          </button>
                          <input 
                              type="text"
                              value={inputText}
                              onChange={e => setInputText(e.target.value)}
                              placeholder="Simulate your speech..."
                              className="flex-1 bg-gray-800 text-white text-sm rounded-xl px-4 outline-none focus:ring-2 focus:ring-emerald-500"
                              disabled={isProcessing}
                          />
                          <button 
                             type="submit"
                             disabled={!inputText.trim() || isProcessing}
                             className="p-3 bg-emerald-600 text-white rounded-xl shrink-0 disabled:opacity-50"
                          >
                              <Send className="w-5 h-5" />
                          </button>
                      </div>
                  </form>

              </div>
          )}

          {/* Call Controls */}
          <div className="mt-auto px-8 pb-10 pt-4 bg-gray-900/50 backdrop-blur-md">
            <div className="flex justify-center items-center gap-8">
              {callState === "idle" ? (
                <button
                  onClick={startCall}
                  className="w-16 h-16 bg-emerald-500 hover:bg-emerald-400 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 transition-transform hover:scale-105 active:scale-95"
                >
                  <Phone className="w-7 h-7" />
                </button>
              ) : (
                <>
                  <button className="w-12 h-12 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center text-gray-300">
                    <Volume2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={endCall}
                    className="w-16 h-16 bg-red-500 hover:bg-red-400 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-500/30 transition-transform hover:scale-105 active:scale-95"
                  >
                    <PhoneOff className="w-7 h-7" />
                  </button>
                  <button className="w-12 h-12 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center text-gray-300">
                    <Mic className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

    <div className="ml-12 max-w-sm hidden lg:block text-gray-400">
        <h3 className="text-emerald-400 font-bold mb-4 text-xl">How to test</h3>
        <ol className="space-y-4 list-decimal pl-4">
            <li>Open this phone page in one browser window/monitor.</li>
            <li>Open the Farmer/Worker dashboard in another window.</li>
            <li>Click the Green phone button to start the test call.</li>
            <li>Type or say commands like <span className="text-white italic">"Add 50kg tomatoes from Pune for 100 rupees"</span> or <span className="text-white italic">"Navigate to workforce section"</span>.</li>
            <li>Watch the dashboard beautifully execute the task while your phone listens for the final feedback!</li>
        </ol>
    </div>

    </div>
  );
}

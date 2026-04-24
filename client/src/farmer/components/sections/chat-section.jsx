import React, { useState } from "react";
import { Send, User, Search, Store, Video } from "lucide-react";
import { useTranslation } from "../../../consumer/i18n/config.jsx";

export default function ChatSection({ activeChats }) {
  const { t } = useTranslation();
  const [selectedChat, setSelectedChat] = useState(
    activeChats?.length > 0 ? activeChats[activeChats.length - 1] : null
  );
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState({
    // Pre-populate with some initial greetings
    FreshMart: [
      { sender: "Retailer", text: t("chat.seedGreeting"), time: "10:00 AM" }
    ]
  });

  const handleSend = () => {
    if (!message.trim() || !selectedChat) return;
    const newMsg = { sender: "Farmer", text: message, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    
    setMessages(prev => ({
      ...prev,
      [selectedChat.name]: [...(prev[selectedChat.name] || []), newMsg]
    }));
    setMessage("");
  };

  const handleJitsiCall = () => {
    if (!selectedChat) return;
    const roomName = `Gramos-${selectedChat.name.replace(/\s+/g, '')}-${Date.now()}`;
    const domain = "meet.jit.si";
    window.open(`https://${domain}/${roomName}`, "_blank");
  };

  if (!activeChats || activeChats.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-green-100 p-12 text-center mt-6">
        <Store className="w-16 h-16 text-emerald-200 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t("chat.noActive")}</h2>
        <p className="text-gray-500">{t("chat.noActiveDesc")}</p>
      </div>
    );
  }

  const currentMessages = selectedChat ? (messages[selectedChat.name] || []) : [];

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-green-100 flex h-[600px] mt-6">
      {/* Main Chat Area (Now on Left) */}
      {selectedChat ? (
        <div className="w-2/3 flex flex-col bg-slate-50 border-r border-gray-100">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selectedChat.name}</h2>
                <p className="text-xs font-medium text-emerald-600">{t("chat.onlineFarmer")}</p>
              </div>
            </div>
            <button 
              onClick={handleJitsiCall}
              className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              title={t("chat.startVideoCall")}
            >
              <Video className="w-5 h-5" />
            </button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {!messages[selectedChat.name]?.length && (
              <div className="text-center mt-10">
                <div className="inline-block bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                  <p className="text-gray-500 text-sm font-medium mt-1">{t("chat.ready")}</p>
                </div>
              </div>
            )}
            {currentMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === "Farmer" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${msg.sender === "Farmer" ? "bg-emerald-600 text-white rounded-tr-sm" : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm"}`}>
                  <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                  <p className={`text-[10px] mt-1.5 text-right font-medium ${msg.sender === "Farmer" ? "text-emerald-100" : "text-gray-400"}`}>{msg.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex gap-3">
              <input 
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t("chat.typeMessage")} 
                className="flex-1 px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors text-sm font-medium"
              />
              <button 
                onClick={handleSend}
                className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl shadow-md transition-all flex items-center justify-center transform hover:scale-105"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-2/3 flex flex-col items-center justify-center bg-gray-50/50 border-r border-gray-100">
          <Store className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">{t("chat.selectToStart")}</p>
        </div>
      )}

      {/* Right Sidebar - Chat List (Moved from left) */}
      <div className="w-1/3 flex flex-col bg-gray-50/50">
        <div className="p-5 border-b border-gray-100 bg-white">
          <h2 className="text-xl font-bold text-gray-900">{t("chat.farmers")}</h2>
          <div className="mt-4 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder={t("chat.searchActive")} 
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {activeChats.map(chat => (
            <div 
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${selectedChat?.id === chat.id ? 'bg-emerald-50 border-r-4 border-r-emerald-500' : 'bg-white hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <User className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 truncate">{chat.name}</h3>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{chat.topic}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

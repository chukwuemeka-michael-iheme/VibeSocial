
import React, { useRef, useState, useEffect } from 'react';
/* Added Plus to the imports from lucide-react */
import { Radio, Users, MessageCircle, Heart, Share2, Shield, Settings, Power, Send, Plus } from 'lucide-react';

/* Added user prop to fix TypeScript error in App.tsx */
export const Live: React.FC<{ user: any }> = ({ user }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLive, setIsLive] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [chatMsg, setChatMsg] = useState('');
  const [chats, setChats] = useState([
    { user: 'AlexCodes', text: 'This UI is super clean! 🔥', color: 'text-sky-400' },
    { user: 'SarahDesigns', text: 'How are you handling the real-time events?', color: 'text-pink-400' },
    { user: 'TechGuru', text: 'Gemini integration looks amazing.', color: 'text-emerald-400' },
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  const toggleLive = async () => {
    if (!isLive) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
        setIsLive(true);
        setViewers(Math.floor(Math.random() * 50) + 120);
      } catch (err) {
        alert("Please allow camera/mic access to start streaming.");
      }
    } else {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
      setIsLive(false);
      setViewers(0);
    }
  };

  const handleSendChat = () => {
    if (!chatMsg.trim()) return;
    setChats([...chats, { user: 'You', text: chatMsg, color: 'text-violet-400' }]);
    setChatMsg('');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
      {/* Stream Area */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="relative flex-1 bg-slate-950 rounded-[40px] overflow-hidden border border-slate-800 shadow-2xl group">
          {/* Overlay Stats */}
          {isLive && (
            <div className="absolute top-8 left-8 flex items-center gap-4 z-20">
              <div className="flex items-center gap-2 bg-pink-600 text-white px-4 py-1.5 rounded-full text-xs font-black tracking-widest animate-pulse shadow-lg shadow-pink-900/40">
                <Radio size={14} />
                LIVE
              </div>
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xl text-white px-4 py-1.5 rounded-full text-xs font-black tracking-widest border border-white/10">
                <Users size={14} />
                {viewers}
              </div>
            </div>
          )}

          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover"
          />

          {!isLive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-xl z-10 p-12 text-center">
              <div className="p-10 bg-violet-600/10 rounded-[40px] mb-8 text-violet-500 border border-violet-500/20 shadow-[0_0_50px_rgba(139,92,246,0.1)]">
                <Radio size={64} className="animate-pulse" />
              </div>
              <h2 className="text-4xl font-black mb-4 tracking-tight">Ready to Broadcast?</h2>
              <p className="text-slate-400 mb-10 max-w-sm text-lg font-medium leading-relaxed">Go live and share your vibes with thousands of people instantly.</p>
              <button 
                onClick={toggleLive}
                className="bg-gradient-to-r from-violet-600 to-pink-600 px-12 py-4 rounded-[20px] font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-violet-900/30"
              >
                GO LIVE NOW
              </button>
            </div>
          )}

          {/* Controls */}
          {isLive && (
             <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 p-5 bg-black/40 backdrop-blur-2xl rounded-3xl z-20 opacity-0 group-hover:opacity-100 transition-all border border-white/5 shadow-2xl">
                <button className="p-3.5 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all active:scale-90 text-slate-300"><Settings size={22} /></button>
                <button className="p-3.5 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all active:scale-90 text-slate-300"><Shield size={22} /></button>
                <div className="w-[1px] h-10 bg-slate-700 mx-2"></div>
                <button 
                  onClick={toggleLive}
                  className="p-3.5 bg-pink-600 hover:bg-pink-700 rounded-2xl transition-all active:scale-95 flex items-center gap-3 font-black px-8 text-white shadow-lg shadow-pink-900/30"
                >
                  <Power size={22} />
                  END BROADCAST
                </button>
             </div>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[40px] shadow-xl">
          <h1 className="text-2xl font-black mb-2 tracking-tight">Building a Social App with Gemini & WebRTC 🚀</h1>
          <p className="text-slate-400 font-medium">Coding marathon. Let's push some code and have a coffee together! Join the chat.</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="w-full lg:w-96 flex flex-col bg-slate-900 border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl flex justify-between items-center">
          <h3 className="font-black flex items-center gap-3 tracking-widest text-xs uppercase">
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-ping" />
            Live Chat
          </h3>
          <button className="text-slate-500 hover:text-slate-300 active:scale-90 transition-all"><Settings size={18} /></button>
        </div>
        
        <div className="flex-1 p-6 overflow-y-auto space-y-6 no-scrollbar">
          {chats.map((chat, i) => (
            <div key={i} className="flex flex-col group animate-in slide-in-from-bottom-2">
              <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${chat.color}`}>{chat.user}</span>
              <p className="text-sm text-slate-300 font-medium leading-relaxed bg-slate-950/30 p-3 rounded-2xl rounded-tl-none border border-slate-800/50 group-hover:border-slate-700 transition-colors">{chat.text}</p>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-950/20 space-y-6">
          <div className="flex justify-around items-center">
            <button className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-pink-500 transition-all active:scale-75 group">
              <div className="p-3 bg-slate-800 rounded-2xl group-hover:bg-pink-500/10 transition-colors"><Heart size={20} /></div>
              <span className="text-[10px] font-black uppercase tracking-tighter">1.2K</span>
            </button>
            <button className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-sky-400 transition-all active:scale-75 group">
              <div className="p-3 bg-slate-800 rounded-2xl group-hover:bg-sky-400/10 transition-colors"><Share2 size={20} /></div>
              <span className="text-[10px] font-black uppercase tracking-tighter">450</span>
            </button>
            <button className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-emerald-400 transition-all active:scale-75 group">
              <div className="p-3 bg-slate-800 rounded-2xl group-hover:bg-emerald-400/10 transition-colors"><Plus size={20} /></div>
              <span className="text-[10px] font-black uppercase tracking-tighter">Tip</span>
            </button>
          </div>
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendChat(); }}
            className="relative flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2 focus-within:border-violet-500/50 transition-colors shadow-inner"
          >
             <input 
              type="text" 
              value={chatMsg}
              onChange={(e) => setChatMsg(e.target.value)}
              placeholder="Join the conversation..." 
              className="w-full bg-transparent border-none focus:ring-0 text-sm outline-none text-slate-300 py-2"
            />
            <button 
              type="submit"
              disabled={!chatMsg.trim()}
              className={`p-2 rounded-xl active:scale-75 transition-all ${chatMsg.trim() ? 'text-violet-500' : 'text-slate-700'}`}
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

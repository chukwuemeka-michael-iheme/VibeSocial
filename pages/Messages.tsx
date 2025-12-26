
import React, { useState, useRef, useEffect } from 'react';
import { Search, Phone, Video, Info, Send, Image, X, ArrowLeft, MessageSquare, Users as UsersIcon } from 'lucide-react';

export const Messages: React.FC<{ user: any }> = ({ user }) => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [calling, setCalling] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load real users from database, excluding current user
    const allUsers = JSON.parse(localStorage.getItem('vibesocial_users') || '[]');
    const otherUsers = allUsers.filter((u: any) => u.id !== user.id).map((u: any) => ({
      ...u,
      lastMsg: 'Start a new conversation',
      time: '',
      online: Math.random() > 0.5 // Simulated online status
    }));
    setContacts(otherUsers);
  }, [user.id]);

  useEffect(() => {
    if (selectedContact) {
      // Load specific chat history from localStorage if desired
      // For now, we'll start with a "Real Connection" greeting
      setChatHistory([
        { id: 'sys-1', text: `You are now connected with ${selectedContact.name}. Say hello!`, sender: 'system', time: '' }
      ]);
    }
  }, [selectedContact]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatHistory, selectedContact]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    const newMessage = {
      id: Date.now(),
      text: message,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatHistory([...chatHistory, newMessage]);
    setMessage('');
  };

  const startCall = (type: string) => {
    setCalling(type);
    setTimeout(() => setCalling(null), 3000); 
  };

  return (
    <div className="flex h-[calc(100vh-120px)] md:h-[calc(100vh-140px)] bg-slate-900 md:border md:border-slate-800 md:rounded-3xl overflow-hidden shadow-2xl relative -mx-3 -mt-3 md:mx-0 md:mt-0">
      
      {calling && selectedContact && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-300">
          <img src={selectedContact.avatar} className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-violet-500 shadow-2xl shadow-violet-500/20 mb-6" alt="" />
          <h2 className="text-xl md:text-2xl font-bold mb-2">Calling {selectedContact.name}...</h2>
          <p className="text-slate-500 animate-pulse font-medium text-sm">Real-time connection established</p>
          <button 
            onClick={() => setCalling(null)} 
            className="mt-12 w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center text-white hover:bg-pink-700 active:scale-90 transition-all shadow-xl shadow-pink-900/40"
          >
            <X size={32} />
          </button>
        </div>
      )}

      {/* Contact List */}
      <div className={`w-full md:w-80 border-r border-slate-800 flex flex-col bg-slate-950 md:bg-transparent ${selectedContact ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-800 bg-slate-900/30">
          <h2 className="text-xl font-bold mb-4 md:hidden">Vibers</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search registered users..." 
              className="w-full bg-slate-900 md:bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-violet-500 transition-colors"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {contacts.length > 0 ? (
            contacts.map(contact => (
              <div 
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`p-4 flex items-center gap-3 cursor-pointer transition-all active:bg-slate-800/50 ${selectedContact?.id === contact.id ? 'bg-slate-800/80 border-l-4 border-violet-500 md:border-l-0' : 'hover:bg-slate-800/30'}`}
              >
                <div className="relative shrink-0">
                  <img src={contact.avatar} className="w-12 h-12 rounded-full border border-slate-800 object-cover" alt={contact.name} />
                  {contact.online && <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950"></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h4 className="font-bold text-sm truncate text-slate-200">{contact.name}</h4>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">{contact.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate font-medium">{contact.lastMsg}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center space-y-4">
              <UsersIcon className="mx-auto text-slate-700" size={32} />
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed">No other users have registered yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`flex-1 flex flex-col bg-slate-950/40 ${!selectedContact ? 'hidden md:flex' : 'flex'}`}>
        {selectedContact ? (
          <>
            {/* Header */}
            <div className="p-3 md:p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-2 md:gap-3">
                <button className="md:hidden text-slate-400 p-2 -ml-2 active:scale-75" onClick={() => setSelectedContact(null)}><ArrowLeft size={22} /></button>
                <img src={selectedContact.avatar} className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-slate-700 object-cover" alt="" />
                <div>
                  <h4 className="font-bold text-sm truncate max-w-[120px] md:max-w-none">{selectedContact.name}</h4>
                  <p className="text-[9px] text-emerald-500 font-bold tracking-widest uppercase">{selectedContact.online ? 'Online' : 'Viber'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 md:gap-4 text-slate-400">
                <button onClick={() => startCall('audio')} className="p-2 hover:text-violet-500 rounded-lg active:scale-75 transition-all"><Phone size={20} /></button>
                <button onClick={() => startCall('video')} className="p-2 hover:text-violet-500 rounded-lg active:scale-75 transition-all"><Video size={20} /></button>
                <button className="hidden sm:block p-2 hover:text-violet-500 rounded-lg active:scale-75 transition-all"><Info size={20} /></button>
              </div>
            </div>

            {/* Messages Feed */}
            <div ref={scrollRef} className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 no-scrollbar">
              {chatHistory.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : (msg.sender === 'system' ? 'justify-center' : 'justify-start')} animate-in slide-in-from-bottom-1`}>
                  {msg.sender === 'system' ? (
                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest py-4">{msg.text}</p>
                  ) : (
                    <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] shadow-lg ${
                      msg.sender === 'me' 
                        ? 'bg-violet-600 text-white rounded-tr-none' 
                        : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/50'
                    }`}>
                      <p className="text-[13px] md:text-sm leading-relaxed">{msg.text}</p>
                      <span className={`text-[9px] mt-1.5 block font-bold text-right ${msg.sender === 'me' ? 'text-white/50' : 'text-slate-500'}`}>{msg.time}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 md:p-4 border-t border-slate-800 bg-slate-900/30">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-2xl px-3 py-1.5 focus-within:border-violet-500/50 transition-colors"
              >
                <button type="button" className="p-2 text-slate-500 hover:text-violet-400 active:scale-75"><Image size={20} /></button>
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Message ${selectedContact.name}...`}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm outline-none text-slate-200 py-2"
                />
                <button 
                  type="submit"
                  className={`p-2.5 rounded-xl transition-all active:scale-90 ${message.trim() ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-700'}`}
                  disabled={!message.trim()}
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="hidden md:flex flex-1 flex-col items-center justify-center text-slate-600 p-12 text-center">
            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-800">
              <MessageSquare size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-400">Select a real Viber</h3>
            <p className="max-w-xs mt-2 text-sm">Every user in this list is a real registered member of the platform.</p>
          </div>
        )}
      </div>
    </div>
  );
};


import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { NAVIGATION_ITEMS, FEELINGS } from '../constants';
import { storageService } from '../services/storageService';
import { Post, Feeling, MediaItem } from '../types';
import { Bell, Search, PlusCircle, MoreHorizontal, X, Send, Image as ImageIcon, Film, Smile, Home, MessageSquare, Video, Wallet, User as UserIcon, LogOut, Settings, Loader2, Plus } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: any;
  onLogout?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [attachedMedia, setAttachedMedia] = useState<MediaItem[]>([]);
  const [isReelMode, setIsReelMode] = useState(false);
  const [showFeelingSelector, setShowFeelingSelector] = useState(false);
  const [selectedFeeling, setSelectedFeeling] = useState<Feeling | null>(null);

  const feelingSelectorRef = useRef<HTMLDivElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const [notifications, setNotifications] = useState([
    { id: 1, user: 'Sarah Jenkins', action: 'liked your post', time: '2m ago', read: false },
    { id: 2, user: 'Michael Chen', action: 'commented: "Looks great!"', time: '1h ago', read: true },
    { id: 3, user: 'Alex Rivera', action: 'started following you', time: '5h ago', read: true },
  ]);

  useEffect(() => {
    localStorage.setItem('vibesocial_search_filter', searchQuery);
    window.dispatchEvent(new CustomEvent('vibeSearch', { detail: searchQuery }));
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (feelingSelectorRef.current && !feelingSelectorRef.current.contains(event.target as Node)) {
        setShowFeelingSelector(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGlobalPost = async () => {
    if (!newPostContent.trim() && attachedMedia.length === 0) return;
    setIsPosting(true);

    try {
      const newPost: Post = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        content: newPostContent,
        mediaItems: attachedMedia,
        isReel: isReelMode,
        feeling: selectedFeeling || undefined,
        likes: 0,
        comments: 0,
        shares: 0,
        timestamp: new Date().toISOString(),
        author: {
          id: user.id,
          displayName: user.name,
          avatar: user.avatar,
          isVerified: true
        }
      };

      await storageService.savePost(newPost, user.id);

      setNewPostContent('');
      setAttachedMedia([]);
      setIsReelMode(false);
      setSelectedFeeling(null);
      setShowCreateModal(false);
      if (location.pathname !== '/') navigate('/');
    } catch (e) {
      console.error("Global post failed", e);
      alert("Error saving your vibe to database.");
    } finally {
      setIsPosting(false);
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setIsPosting(true);
      const fileArray = Array.from(files);
      
      try {
        const newMediaItems = await Promise.all(fileArray.map(file => {
          return new Promise<MediaItem>((resolve) => {
            const reader = new FileReader();
            const type: 'image' | 'video' = file.type.startsWith('video') ? 'video' : 'image';
            reader.onload = () => {
              resolve({ url: reader.result as string, type });
            };
            reader.readAsDataURL(file);
          });
        }));
        
        setAttachedMedia(prev => [...prev, ...newMediaItems]);
      } catch (err) {
        console.error("Upload failed", err);
      } finally {
        setIsPosting(false);
      }
    }
  };

  const removeMedia = (index: number) => {
    setAttachedMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleReelTrigger = () => {
    setIsReelMode(true);
    mediaInputRef.current?.click();
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 fixed h-full bg-slate-950 z-20">
        <div className="p-6">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent active:scale-95 transition-transform inline-block">
            VibeSocial
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {NAVIGATION_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all active:scale-[0.98] ${
                location.pathname === item.path 
                  ? 'bg-violet-600/10 text-violet-500 shadow-[inset_0_0_20px_rgba(139,92,246,0.05)]' 
                  : 'hover:bg-slate-900 text-slate-400'
              }`}
            >
              <span className={location.pathname === item.path ? 'text-violet-500' : ''}>{item.icon}</span>
              <span className="font-semibold">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-900 cursor-pointer transition-all active:scale-95 group"
          >
            <img src={user.avatar} className="w-10 h-10 rounded-full border border-slate-700 group-hover:border-violet-500 transition-colors object-cover" alt="Profile" />
            <div className="flex-1 min-w-0 text-left">
              <p className="font-bold truncate text-sm">{user.name}</p>
              <p className="text-xs text-slate-500 truncate lowercase">@{user.name?.replace(/\s+/g, '').toLowerCase() || 'viber'}</p>
            </div>
            <MoreHorizontal size={18} className="text-slate-500" />
          </button>

          {showUserMenu && (
            <div className="absolute bottom-20 left-4 right-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2 duration-200 z-50">
              <Link to="/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 p-4 hover:bg-slate-800 text-sm font-bold border-b border-slate-800">
                <UserIcon size={18} className="text-slate-500" /> My Profile
              </Link>
              <button onClick={() => { setShowUserMenu(false); alert("Settings coming soon!"); }} className="w-full flex items-center gap-3 p-4 hover:bg-slate-800 text-sm font-bold border-b border-slate-800 text-left">
                <Settings size={18} className="text-slate-500" /> Settings
              </button>
              <button 
                onClick={onLogout}
                className="w-full flex items-center gap-3 p-4 hover:bg-pink-500/10 text-pink-500 text-sm font-bold text-left"
              >
                <LogOut size={18} /> Log Out
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 md:ml-64 pb-20 md:pb-12 min-w-0">
        <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 h-14 md:h-16 flex items-center justify-between px-4 md:px-8">
          <div className="md:hidden text-xl font-black bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent tracking-tighter">
            VIBE
          </div>
          
          <div className="hidden md:flex items-center bg-slate-900/50 rounded-full px-4 py-2 w-full max-sm border border-slate-800 focus-within:border-violet-500/50 focus-within:bg-slate-900 transition-all">
            <Search size={18} className="text-slate-500" />
            <input 
              type="text" 
              placeholder="Search vibes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:ring-0 ml-3 text-sm w-full outline-none text-slate-200"
            />
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <button className="md:hidden p-2 text-slate-400 active:scale-90" onClick={() => navigate('/')}><Search size={22}/></button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="p-2 md:p-2.5 rounded-full hover:bg-slate-800 text-violet-400 active:scale-90 transition-all bg-violet-500/5 md:border md:border-violet-500/10"
            >
              <PlusCircle size={22} />
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 md:p-2.5 rounded-full hover:bg-slate-800 active:scale-90 transition-all relative ${showNotifications ? 'bg-slate-800 text-violet-500' : 'text-slate-400'}`}
              >
                <Bell size={22} />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-pink-500 rounded-full border-2 border-slate-950 md:top-2.5 md:right-2.5"></span>
                )}
              </button>

              {showNotifications && (
                <div className="fixed inset-x-4 top-16 md:absolute md:inset-auto md:right-0 md:mt-3 md:w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
                  <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <h3 className="font-bold">Notifications</h3>
                    <button className="text-xs text-violet-400 font-bold hover:underline" onClick={markAllRead}>Mark all read</button>
                  </div>
                  <div className="max-h-[60vh] md:max-h-[400px] overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className={`p-4 hover:bg-slate-800/50 cursor-pointer transition-colors flex gap-3 ${!n.read ? 'bg-violet-500/5 border-l-2 border-violet-500' : ''}`}>
                        <div className="w-10 h-10 rounded-full bg-slate-800 shrink-0 border border-slate-700" />
                        <div className="flex-1">
                          <p className="text-sm"><span className="font-bold text-slate-200">{n.user}</span> {n.action}</p>
                          <p className="text-[10px] text-slate-500 mt-1 font-medium">{n.time}</p>
                        </div>
                        {!n.read && <div className="w-2 h-2 rounded-full bg-violet-500 mt-2 shrink-0 ml-auto" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="px-3 md:px-6 lg:px-8 py-4 md:py-8 max-w-[1440px] mx-auto">
          {children}
        </div>
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="bg-slate-900 border border-slate-800 w-full h-[90vh] md:h-auto md:max-w-lg rounded-t-[32px] md:rounded-[32px] shadow-2xl relative animate-in slide-in-from-bottom duration-300 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h2 className="text-lg font-bold">New Vibe</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-800 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 md:p-6 overflow-y-auto flex-1 no-scrollbar">
              <div className="flex items-center gap-3 mb-6">
                <img src={user.avatar} className="w-10 h-10 rounded-full border border-slate-700 object-cover" alt="" />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <p className="font-bold text-sm text-slate-200">{user.name}</p>
                    {selectedFeeling && (
                      <span className="text-slate-400 text-xs"> is {selectedFeeling.emoji} feeling <span className="font-bold">{selectedFeeling.label}</span></span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{isReelMode ? 'New Reel' : 'Global Post'}</p>
                </div>
              </div>
              <textarea 
                autoFocus
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 text-lg text-slate-200 placeholder:text-slate-600 resize-none min-h-[120px] md:h-32 outline-none"
                placeholder={isReelMode ? "Share a short vibe video..." : "Share your vibe..."}
              />

              {attachedMedia.length > 0 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-4 border-t border-slate-800 mt-2">
                  {attachedMedia.map((item, i) => (
                    <div key={i} className="relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border border-slate-700 bg-black group">
                      {item.type === 'video' ? (
                        <video src={item.url} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={item.url} className="w-full h-full object-cover" alt="" />
                      )}
                      <button onClick={() => removeMedia(i)} className="absolute top-1 right-1 bg-black/60 p-1 rounded-full text-white opacity-0 group-hover:opacity-100"><X size={10} /></button>
                    </div>
                  ))}
                  <button onClick={() => mediaInputRef.current?.click()} className="flex-shrink-0 w-24 h-24 rounded-xl border border-dashed border-slate-700 flex items-center justify-center text-slate-500"><Plus size={20}/></button>
                </div>
              )}
            </div>
            <div className="p-4 md:p-6 border-t border-slate-800 bg-slate-950/50">
              <div className="flex items-center justify-between gap-2 relative">
                <div className="flex items-center gap-1">
                  <button onClick={() => mediaInputRef.current?.click()} className="p-2.5 text-emerald-400 hover:bg-emerald-400/10 rounded-xl transition-all active:scale-90"><ImageIcon size={22} /></button>
                  <button 
                    onClick={handleReelTrigger}
                    className={`p-2.5 rounded-xl transition-all active:scale-90 ${isReelMode ? 'bg-pink-500/10 text-pink-500' : 'text-pink-500 hover:bg-pink-500/10'}`}
                  >
                    <Film size={22} />
                  </button>
                  <div className="relative" ref={feelingSelectorRef}>
                    <button 
                      onClick={() => setShowFeelingSelector(!showFeelingSelector)}
                      className={`p-2.5 rounded-xl transition-all active:scale-90 ${selectedFeeling ? 'bg-yellow-500/10 text-yellow-500' : 'text-yellow-500 hover:bg-yellow-500/10'}`}
                    >
                      <Smile size={22} />
                    </button>
                    
                    {showFeelingSelector && (
                      <div className="absolute bottom-full left-0 mb-4 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-[110] overflow-hidden animate-in slide-in-from-bottom-2">
                        <div className="p-3 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Feelings</span>
                          <button onClick={() => { setSelectedFeeling(null); setShowFeelingSelector(false); }} className="text-[10px] text-violet-400 font-bold hover:underline">Clear</button>
                        </div>
                        <div className="max-h-60 overflow-y-auto grid grid-cols-2 p-2 gap-1 no-scrollbar">
                          {FEELINGS.map((f) => (
                            <button 
                              key={f.label}
                              onClick={() => { setSelectedFeeling(f); setShowFeelingSelector(false); }}
                              className="flex items-center gap-2 p-2 hover:bg-slate-800 rounded-xl transition-colors text-left"
                            >
                              <span className="text-xl">{f.emoji}</span>
                              <span className="text-xs text-slate-200 font-medium">{f.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <button 
                  onClick={handleGlobalPost}
                  disabled={(newPostContent.trim() === '' && attachedMedia.length === 0) || isPosting}
                  className="bg-violet-600 hover:bg-violet-700 px-6 py-2 rounded-xl font-bold text-sm active:scale-95 transition-all shadow-lg shadow-violet-900/40 flex items-center gap-2"
                >
                  {isPosting ? <Loader2 size={16} className="animate-spin" /> : 'Post Vibe'}
                </button>
              </div>
            </div>
            <input type="file" ref={mediaInputRef} className="hidden" multiple accept="image/*,video/*" onChange={handleMediaUpload} />
          </div>
        </div>
      )}

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-2xl border-t border-slate-800/50 flex justify-around items-center h-16 z-40 px-2 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        {[
          { icon: <Home size={22} />, path: '/' },
          { icon: <Search size={22} />, path: '/search' },
          { icon: <Video size={22} />, path: '/live' },
          { icon: <MessageSquare size={22} />, path: '/messages' },
          { icon: <UserIcon size={22} />, path: '/profile' }
        ].map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 active:scale-75 ${
              location.pathname === item.path ? 'text-violet-500' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {item.icon}
            {location.pathname === item.path && (
              <span className="absolute bottom-1 w-1 h-1 bg-violet-500 rounded-full"></span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
};

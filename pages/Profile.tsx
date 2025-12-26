
import React, { useState, useRef, useEffect } from 'react';
import { PostCard } from '../components/PostCard';
import { StoryCreator } from '../components/StoryCreator';
import { storageService } from '../services/storageService';
import { Post } from '../types';
import { 
  User, Camera, Edit3, Save, X, CheckCircle, MapPin, 
  Link as LinkIcon, Calendar, Loader2, Briefcase, GraduationCap, 
  Plus, LogOut, Info, MoreHorizontal, Image as ImageIcon, Users, Film, UserCheck, UserPlus
} from 'lucide-react';

interface ProfileProps {
  user: any;
  onUpdateUser: (updatedData: any) => void;
  onLogout?: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showStoryCreator, setShowStoryCreator] = useState(false);
  const [activeTab, setActiveTab] = useState('POSTS');
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [followingUsers, setFollowingUsers] = useState<any[]>([]);
  const [followersUsers, setFollowersUsers] = useState<any[]>([]);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    name: user.name || 'Vibe User',
    bio: user.bio || 'Building the future of social web 🚀',
    location: user.location || 'San Francisco, CA',
    website: user.website || 'vibesocial.app/profile',
    work: user.work || 'Lead Engineer at VibeSocial',
    education: user.education || 'Stanford University',
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isReading, setIsReading] = useState<string | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'info'} | null>(null);

  const loadProfileData = async () => {
    try {
      const globalPosts = await storageService.getAllPosts();
      setUserPosts(globalPosts.filter((p: any) => p.userId === user.id));

      const users = JSON.parse(localStorage.getItem('vibesocial_users') || '[]');
      const followingIds = user.following || [];
      setFollowingUsers(users.filter((u: any) => followingIds.includes(u.id)));
      const followers = users.filter((u: any) => u.following?.includes(user.id));
      setFollowersUsers(followers);
    } catch (err) {
      console.error("Profile load failed:", err);
    }
  };

  useEffect(() => {
    loadProfileData();
    window.addEventListener('vibeUpdate', loadProfileData);
    return () => window.removeEventListener('vibeUpdate', loadProfileData);
  }, [user.id, user.following]);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleTabSwitch = (tab: string) => {
    setActiveTab(tab);
    tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      const updatedUser = {
        ...user,
        ...formData
      };
      onUpdateUser(updatedUser);
      setIsSaving(false);
      setIsEditing(false);
      showToast('Profile updated and saved to vault!');
    }, 800);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, field: 'avatar' | 'coverPhoto') => {
    const file = event.target.files?.[0];
    if (file) {
      setIsReading(field);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const updatedUser = { ...user, [field]: reader.result as string };
          onUpdateUser(updatedUser);
          showToast(`${field === 'avatar' ? 'Profile picture' : 'Cover photo'} updated!`);
        }
        setIsReading(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Extract all media from user's posts for the photos grid
  const userPhotos = userPosts.flatMap(p => p.mediaItems || []).map(m => m.url);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'ABOUT':
        return (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 md:p-8 animate-in fade-in duration-300">
            <h2 className="text-xl font-bold mb-6">About</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                 <div>
                  <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest mb-4">Overview</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-slate-300">
                      <Briefcase size={18} className="text-slate-500" />
                      <span>{user.work || formData.work}</span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-300">
                      <GraduationCap size={18} className="text-slate-500" />
                      <span>Studied at {user.education || formData.education}</span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-300">
                      <MapPin size={18} className="text-slate-500" />
                      <span>Lives in {user.location || formData.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'FOLLOWING':
        return (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Following</h2>
              <div className="text-xs font-bold text-violet-400">{followingUsers.length} Users</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {followingUsers.map(f => (
                <div key={f.id} className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-2xl border border-slate-800/50 hover:bg-slate-800/50 transition-colors group cursor-pointer">
                  <img src={f.avatar} className="w-16 h-16 rounded-xl object-cover" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate group-hover:text-violet-400 transition-colors text-sm">{f.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Viber</p>
                  </div>
                  <UserCheck size={18} className="text-violet-400" />
                </div>
              ))}
              {followingUsers.length === 0 && (
                <div className="col-span-full py-20 text-center text-slate-500 italic">You aren't following anyone yet.</div>
              )}
            </div>
          </div>
        );
      case 'FOLLOWERS':
        return (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Followers</h2>
              <div className="text-xs font-bold text-violet-400">{followersUsers.length} People</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {followersUsers.map(f => (
                <div key={f.id} className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-2xl border border-slate-800/50 hover:bg-slate-800/50 transition-colors group cursor-pointer">
                  <img src={f.avatar} className="w-16 h-16 rounded-xl object-cover" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate group-hover:text-violet-400 transition-colors text-sm">{f.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Following You</p>
                  </div>
                </div>
              ))}
              {followersUsers.length === 0 && (
                <div className="col-span-full py-20 text-center text-slate-500 italic">No followers yet. Share your vibe to get noticed!</div>
              )}
            </div>
          </div>
        );
      case 'PHOTOS':
        return (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 animate-in fade-in duration-300">
            <h2 className="text-xl font-bold mb-6">Photos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {userPhotos.map((url, i) => (
                <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-slate-800 hover:scale-[1.02] transition-transform cursor-pointer">
                  <img src={url} className="w-full h-full object-cover" alt="" />
                </div>
              ))}
              {userPhotos.length === 0 && (
                <div className="col-span-full py-20 text-center text-slate-500">No photos shared in your vibes yet.</div>
              )}
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-1/3 space-y-6">
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-xl font-bold mb-4">Intro</h3>
                <div className="space-y-4">
                  <p className="text-center text-sm text-slate-200 py-2 border-b border-slate-800/50 leading-relaxed italic">{user.bio || formData.bio}</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-slate-300 text-sm"><Briefcase size={18} className="text-slate-500" /> <span>Works at <span className="font-bold">{user.work || formData.work}</span></span></div>
                    <div className="flex items-center gap-3 text-slate-300 text-sm"><GraduationCap size={18} className="text-slate-500" /> <span>Studied at <span className="font-bold">{user.education || formData.education}</span></span></div>
                    <div className="flex items-center gap-3 text-slate-300 text-sm"><MapPin size={18} className="text-slate-500" /> <span>From <span className="font-bold">{user.location || formData.location}</span></span></div>
                    <div className="flex items-center gap-3 text-slate-300 text-sm"><ImageIcon size={18} className="text-slate-500" /> <span>Joined VibeSocial Oct 2023</span></div>
                  </div>
                  <button onClick={() => setIsEditing(true)} className="w-full bg-slate-800 hover:bg-slate-700 py-3 rounded-xl text-sm font-bold transition-all active:scale-95">Edit Details</button>
                </div>
              </div>

              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Photos</h3>
                  <button onClick={() => handleTabSwitch('PHOTOS')} className="text-xs font-bold text-violet-400 hover:underline">See all photos</button>
                </div>
                <div className="grid grid-cols-3 gap-2 rounded-xl overflow-hidden border border-slate-800">
                   {userPhotos.slice(0, 9).map((url, i) => (
                     <img key={i} src={url} className="aspect-square object-cover" alt="" />
                   ))}
                   {userPhotos.length === 0 && <div className="col-span-3 py-10 text-center text-xs text-slate-600">No photos to show</div>}
                </div>
              </div>

              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-xl font-bold">Following</h3>
                  <button onClick={() => handleTabSwitch('FOLLOWING')} className="text-xs font-bold text-violet-400 hover:underline">See all</button>
                </div>
                <p className="text-xs text-slate-500 mb-4">{followingUsers.length} Following</p>
                <div className="grid grid-cols-3 gap-x-2 gap-y-4">
                  {followingUsers.slice(0, 9).map(f => (
                    <div key={f.id} className="space-y-1 group cursor-pointer" onClick={() => handleTabSwitch('FOLLOWING')}>
                      <img src={f.avatar} className="aspect-square w-full rounded-xl object-cover border border-slate-800 group-hover:border-violet-500 transition-colors" alt="" />
                      <p className="text-[10px] font-bold text-slate-200 truncate text-center group-hover:text-violet-400">{f.name.split(' ')[0]}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-6">
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 shadow-xl">
                <div className="flex gap-4 pb-4 border-b border-slate-800/50 mb-3">
                  <img src={user.avatar} className="w-10 h-10 rounded-full border border-slate-800 object-cover" alt="" />
                  <button 
                    onClick={() => showToast("Please use the home feed to create a new vibe!", "info")}
                    className="flex-1 bg-slate-800/50 hover:bg-slate-800 rounded-full px-6 text-left text-slate-500 text-sm transition-colors"
                  >
                    What's on your mind?
                  </button>
                </div>
                <div className="flex items-center justify-around">
                   <button className="flex items-center gap-2 text-slate-400 font-bold text-xs hover:bg-slate-800/50 p-2 rounded-xl transition-all"><Film size={18} className="text-pink-500" /> Live Video</button>
                   <button className="flex items-center gap-2 text-slate-400 font-bold text-xs hover:bg-slate-800/50 p-2 rounded-xl transition-all"><ImageIcon size={18} className="text-emerald-500" /> Photo/Video</button>
                   <button className="flex items-center gap-2 text-slate-400 font-bold text-xs hover:bg-slate-800/50 p-2 rounded-xl transition-all"><Plus size={18} className="text-violet-500" /> Life Event</button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Posts</h3>
                  <div className="flex items-center gap-2">
                    <button className="bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-700 transition-colors">Filters</button>
                    <button className="bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-700 transition-colors">Manage Posts</button>
                  </div>
                </div>
                {userPosts.length > 0 ? (
                  userPosts.map(post => <PostCard key={post.id} post={post} />)
                ) : (
                  <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-20 text-center space-y-4">
                    <ImageIcon size={48} className="mx-auto text-slate-800 opacity-50" />
                    <p className="text-slate-500 font-bold">No posts available to show.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-0 md:px-4 pb-20">
      {toast && (
        <div className="fixed top-20 right-8 z-[110] animate-in slide-in-from-right fade-in duration-300">
          <div className={`px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 font-bold ${toast.type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-violet-600 border-violet-500 text-white'}`}>
            {toast.type === 'success' ? <CheckCircle size={20} /> : <Info size={20} />}
            {toast.message}
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 md:rounded-b-3xl overflow-hidden mb-8 shadow-2xl relative">
        <div className="relative w-full h-48 md:h-80 lg:h-[400px] bg-slate-800">
          <img src={user.coverPhoto || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80'} className={`w-full h-full object-cover transition-opacity ${isReading === 'coverPhoto' ? 'opacity-30' : 'opacity-100'}`} alt="Cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
          <button onClick={() => coverInputRef.current?.click()} className="absolute bottom-4 right-4 bg-black/40 px-4 py-2 rounded-xl text-white border border-white/10 flex items-center gap-2 text-sm font-bold backdrop-blur-md hover:bg-black/60 active:scale-95 transition-all">
            {isReading === 'coverPhoto' ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
            <span>Edit Cover</span>
          </button>
        </div>

        <div className="px-4 md:px-12 pb-4 flex flex-col items-center md:items-end md:flex-row gap-6">
          <div className="relative -mt-16 md:-mt-12 shrink-0">
            <div className="w-40 h-40 md:w-44 md:h-44 bg-slate-800 rounded-full border-4 border-slate-900 overflow-hidden shadow-2xl relative group">
               <img src={user.avatar} className={`w-full h-full object-cover transition-opacity ${isReading === 'avatar' ? 'opacity-30' : 'opacity-100'}`} alt="Avatar" />
               <button onClick={() => avatarInputRef.current?.click()} className="absolute bottom-2 right-2 p-2.5 bg-violet-600 rounded-full text-white border-2 border-slate-900 shadow-xl hover:bg-violet-700 active:scale-90 transition-all">
                {isReading === 'avatar' ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
              </button>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left pt-2 pb-4 border-b border-slate-800/50 w-full md:border-none">
            <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
              <div>
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <h1 className="text-2xl md:text-4xl font-black tracking-tight">{user.name}</h1>
                  <CheckCircle size={24} className="text-sky-400 fill-sky-400/10" />
                </div>
                <div className="flex items-center justify-center md:justify-start gap-1">
                  <button 
                    onClick={() => handleTabSwitch('FOLLOWERS')}
                    className="px-4 py-2 rounded-xl hover:bg-slate-800 transition-all active:scale-95 text-slate-400 font-bold text-sm"
                  >
                    <span className="text-slate-100">{followersUsers.length}</span> Followers
                  </button>
                  <button 
                    onClick={() => handleTabSwitch('FOLLOWING')}
                    className="px-4 py-2 rounded-xl hover:bg-slate-800 transition-all active:scale-95 text-slate-400 font-bold text-sm"
                  >
                    <span className="text-slate-100">{followingUsers.length}</span> Following
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <button onClick={() => setShowStoryCreator(true)} className="flex-1 md:flex-none bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95"><Plus size={18} /> Add to Story</button>
                <button onClick={() => setIsEditing(true)} className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"><Edit3 size={18} /> Edit Profile</button>
                <button onClick={() => setShowLogoutConfirm(true)} className="bg-slate-800 hover:bg-slate-700 text-white p-2.5 rounded-xl transition-all active:scale-95"><LogOut size={18} /></button>
              </div>
            </div>
          </div>
        </div>

        <div ref={tabsRef} className="px-4 md:px-12 flex items-center gap-1 md:gap-4 overflow-x-auto no-scrollbar scroll-mt-20">
           {['POSTS', 'ABOUT', 'FOLLOWERS', 'FOLLOWING', 'PHOTOS'].map(tab => (
             <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-4 text-xs font-black uppercase tracking-widest border-b-4 transition-all whitespace-nowrap ${activeTab === tab ? 'border-violet-600 text-violet-500' : 'border-transparent text-slate-500 hover:bg-slate-800/50'}`}
             >
               {tab}
             </button>
           ))}
           <button className="px-4 py-4 text-xs font-black uppercase tracking-widest border-b-4 border-transparent text-slate-500 flex items-center gap-1">More <MoreHorizontal size={14} /></button>
        </div>
      </div>

      <div className="w-full mt-4 px-2 md:px-0">{renderTabContent()}</div>

      {showStoryCreator && <StoryCreator onClose={() => setShowStoryCreator(false)} onPost={async (data) => {
        const newStory = { ...data, user: { id: user.id, displayName: user.name, avatar: user.avatar } };
        await storageService.saveStory(newStory);
        showToast('Story shared with real vibers!');
      }} />}

      {isEditing && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-0 md:p-10 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full md:max-w-2xl max-h-full md:max-h-[90vh] md:rounded-3xl shadow-2xl relative overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <h2 className="text-xl font-black uppercase tracking-widest text-xs">Edit Identity</h2>
                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-800 rounded-xl transition-colors"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Full Name</label>
                      <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 outline-none focus:border-violet-500 transition-all text-sm" />
                  </div>
                  <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Location</label>
                      <input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 outline-none focus:border-violet-500 transition-all text-sm" />
                  </div>
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Bio</label>
                    <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 outline-none focus:border-violet-500 h-24 resize-none text-sm" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Occupation</label>
                      <input value={formData.work} onChange={e => setFormData({...formData, work: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 outline-none focus:border-violet-500 transition-all text-sm" />
                  </div>
                  <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Education</label>
                      <input value={formData.education} onChange={e => setFormData({...formData, education: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 outline-none focus:border-violet-500 transition-all text-sm" />
                  </div>
                </div>
            </div>
            <div className="p-6 border-t border-slate-800 flex gap-4 bg-slate-950/20 backdrop-blur-xl">
                <button onClick={() => setIsEditing(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">Cancel</button>
                <button onClick={handleSave} disabled={isSaving} className="flex-1 bg-violet-600 hover:bg-violet-700 py-4 rounded-2xl font-black text-xs shadow-xl uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Profile
                </button>
            </div>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-sm rounded-[32px] p-8 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto text-pink-500 border border-pink-500/20"><LogOut size={32} /></div>
            <h3 className="text-xl font-black mb-2">End Session?</h3>
            <div className="flex flex-col gap-3">
              <button onClick={onLogout} className="w-full bg-pink-600 hover:bg-pink-700 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all">Log Out</button>
              <button onClick={() => setShowLogoutConfirm(false)} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all">Go Back</button>
            </div>
          </div>
        </div>
      )}

      <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={e => handleFileChange(e, 'avatar')} />
      <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={e => handleFileChange(e, 'coverPhoto')} />
    </div>
  );
};

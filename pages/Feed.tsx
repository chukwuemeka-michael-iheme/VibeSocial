
import React, { useState, useEffect, useRef } from 'react';
import { PostCard } from '../components/PostCard';
import { StoryCircle } from '../components/StoryCircle';
import { StoryViewer } from '../components/StoryViewer';
import { StoryCreator } from '../components/StoryCreator';
import { ReelsShelf } from '../components/ReelsShelf';
import { ReelsViewer } from '../components/ReelsViewer';
import { geminiService } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { FEELINGS } from '../constants';
import { Sparkles, Image as ImageIcon, Film, Smile, Send, Plus, Users, UserPlus, UserCheck, X, RefreshCw, Loader2, Video, Search } from 'lucide-react';
import { MediaItem, Post, Feeling } from '../types';

interface FeedProps {
  user: any;
  onToggleFollow: (userId: string) => void;
}

export const Feed: React.FC<FeedProps> = ({ user, onToggleFollow }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [discoveryUsers, setDiscoveryUsers] = useState<any[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [attachedMedia, setAttachedMedia] = useState<MediaItem[]>([]);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [showStoryCreator, setShowStoryCreator] = useState(false);
  const [isReelMode, setIsReelMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [showFeelingSelector, setShowFeelingSelector] = useState(false);
  const [selectedFeeling, setSelectedFeeling] = useState<Feeling | null>(null);
  const [activeReelId, setActiveReelId] = useState<string | null>(null);
  
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const feelingSelectorRef = useRef<HTMLDivElement>(null);

  const loadAll = async () => {
    try {
      const [savedPosts, savedStories] = await Promise.all([
        storageService.getAllPosts(),
        storageService.getAllStories()
      ]);
      setPosts(savedPosts);
      setStories(savedStories);
    } catch (err) {
      console.error("Failed to load data from IndexedDB:", err);
    }
    
    const allUsers = JSON.parse(localStorage.getItem('vibesocial_users') || '[]');
    setDiscoveryUsers(allUsers.filter((u: any) => u.id !== user.id).sort(() => 0.5 - Math.random()).slice(0, 5));
  };

  useEffect(() => {
    loadAll();
    
    const handleSync = () => loadAll();
    const handleSearch = (e: any) => setSearchQuery(e.detail || '');

    window.addEventListener('vibeUpdate', handleSync);
    window.addEventListener('storage', handleSync); 
    window.addEventListener('vibeSearch', handleSearch as EventListener);

    const handleClickOutside = (event: MouseEvent) => {
      if (feelingSelectorRef.current && !feelingSelectorRef.current.contains(event.target as Node)) {
        setShowFeelingSelector(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('vibeUpdate', handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('vibeSearch', handleSearch as EventListener);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [user.id]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPosts(posts);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredPosts(posts.filter(p => 
        p.content.toLowerCase().includes(q) || 
        p.author.displayName?.toLowerCase().includes(q)
      ));
    }
  }, [posts, searchQuery]);

  useEffect(() => {
    const fetchSummary = async () => {
      if (posts.length === 0) {
        setSummary("The feed is currently quiet. Be the first to start a conversation!");
        return;
      }
      setLoadingSummary(true);
      const res = await geminiService.getFeedSummary(posts.slice(0, 10));
      setSummary(res || "AI insight not available.");
      setLoadingSummary(false);
    };
    fetchSummary();
  }, [posts.length]);

  const handleCreatePost = async () => {
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
    } catch (error) {
      console.error("Failed to save post:", error);
      alert("Oops! We couldn't save your vibe. IndexedDB error.");
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

  const refreshDiscovery = () => {
    const allUsers = JSON.parse(localStorage.getItem('vibesocial_users') || '[]');
    setDiscoveryUsers(allUsers.filter((u: any) => u.id !== user.id).sort(() => 0.5 - Math.random()).slice(0, 5));
  };

  const handlePostStory = async (storyData: any) => {
    const newStory = {
      ...storyData,
      user: { id: user.id, displayName: user.name, avatar: user.avatar }
    };
    await storageService.saveStory(newStory);
  };

  const reels = posts.filter(p => p.isReel);
  const feedPosts = filteredPosts.filter(p => !p.isReel);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-4 md:gap-6 overflow-x-auto no-scrollbar pb-1">
            <StoryCircle 
              isMe={true} 
              story={stories.find(s => s.user?.id === user.id)} 
              onClick={() => {
                const index = stories.findIndex(s => s.user?.id === user.id);
                if (index !== -1) setActiveStoryIndex(index);
                else setShowStoryCreator(true);
              }}
              onAddClick={() => setShowStoryCreator(true)}
            />
            {stories.filter(s => s.user?.id !== user.id).map((story, i) => (
              <StoryCircle 
                key={story.id} 
                story={story} 
                onClick={() => setActiveStoryIndex(stories.indexOf(story))} 
              />
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex gap-4">
            <img src={user.avatar} className="w-12 h-12 rounded-full border border-slate-700 object-cover" alt="me" />
            <div className="flex-1">
              <div className="flex flex-col mb-2">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-slate-200">{user.name}</span>
                  {selectedFeeling && (
                    <span className="text-slate-400 text-sm"> is {selectedFeeling.emoji} feeling <span className="font-bold">{selectedFeeling.label}</span></span>
                  )}
                </div>
              </div>
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder={`What's on your mind, ${user.name?.split(' ')[0]}?`}
                className="w-full bg-transparent border-none focus:ring-0 text-lg resize-none placeholder:text-slate-600 min-h-[80px] outline-none"
              />
              
              {attachedMedia.length > 0 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-4 border-t border-slate-800 mt-2">
                  {attachedMedia.map((item, i) => (
                    <div key={i} className="relative flex-shrink-0 w-32 h-32 rounded-xl overflow-hidden border border-slate-700 bg-black group">
                      {item.type === 'video' ? (
                        <video src={item.url} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={item.url} className="w-full h-full object-cover" alt="" />
                      )}
                      <button 
                        onClick={() => removeMedia(i)} 
                        className="absolute top-1 right-1 bg-black/60 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                      {item.type === 'video' && <div className="absolute top-1 left-1 bg-black/60 p-1 rounded-md"><Video size={10} className="text-white" /></div>}
                    </div>
                  ))}
                  <button 
                    onClick={() => mediaInputRef.current?.click()}
                    className="flex-shrink-0 w-32 h-32 rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-violet-500 hover:text-violet-500 transition-all"
                  >
                    <Plus size={24} />
                    <span className="text-[10px] font-black uppercase">Add More</span>
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2 relative">
                  <button onClick={() => mediaInputRef.current?.click()} className="flex items-center gap-2 px-3 py-1.5 text-emerald-400 hover:bg-emerald-400/10 rounded-xl transition-all">
                    <ImageIcon size={20} />
                    <span className="hidden md:block text-xs font-bold">Photo/Video</span>
                  </button>
                  <button 
                    onClick={handleReelTrigger} 
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${isReelMode ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' : 'text-pink-400 hover:bg-pink-400/10'}`}
                  >
                    <Film size={20} />
                    <span className="hidden md:block text-xs font-bold">{isReelMode ? 'Reel Mode On' : 'Reel'}</span>
                  </button>
                  <div className="relative" ref={feelingSelectorRef}>
                    <button 
                      onClick={() => setShowFeelingSelector(!showFeelingSelector)} 
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${selectedFeeling ? 'bg-yellow-500/10 text-yellow-500' : 'text-yellow-400 hover:bg-yellow-400/10'}`}
                    >
                      <Smile size={20} />
                      <span className="hidden md:block text-xs font-bold">{selectedFeeling ? selectedFeeling.label : 'Feeling'}</span>
                    </button>
                    
                    {showFeelingSelector && (
                      <div className="absolute bottom-full left-0 mb-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-[60] overflow-hidden animate-in slide-in-from-bottom-2">
                        <div className="p-3 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-widest text-slate-400">How are you feeling?</span>
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
                  onClick={handleCreatePost}
                  disabled={(newPostContent.trim() === '' && attachedMedia.length === 0) || isPosting}
                  className="bg-gradient-to-r from-violet-600 to-pink-600 px-6 py-2 rounded-full font-bold text-white hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-violet-900/20"
                >
                  {isPosting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  {isReelMode ? 'Share Reel' : 'Post Vibe'}
                </button>
              </div>
            </div>
          </div>
          <input type="file" ref={mediaInputRef} className="hidden" accept="image/*,video/*" multiple onChange={handleMediaUpload} />
        </div>

        <ReelsShelf reels={reels} user={user} onCreateClick={handleReelTrigger} onReelClick={(reel) => setActiveReelId(reel.id)} />

        <div className="space-y-4">
          {feedPosts.length > 0 ? (
            feedPosts.map(post => <PostCard key={post.id} post={post} currentUser={user} onToggleFollow={onToggleFollow} />)
          ) : (
            <div className="py-20 text-center space-y-4 animate-in fade-in duration-500">
              <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-700">
                <Plus size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-400">{searchQuery ? 'No results found' : 'No vibes yet'}</h3>
              <p className="text-slate-600 text-sm max-w-xs mx-auto">
                {searchQuery ? `We couldn't find any vibes matching "${searchQuery}".` : 'Be the first registered user to share a post and start the community!'}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="hidden lg:block space-y-6 sticky top-24 h-fit">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <Users size={18} className="text-violet-500" />
              Who to follow
            </h3>
            <button onClick={refreshDiscovery} className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1 uppercase tracking-widest transition-colors">
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
          <div className="space-y-4">
            {discoveryUsers.length > 0 ? (
              discoveryUsers.map(u => {
                const isFollowing = user.following?.includes(u.id);
                return (
                  <div key={u.id} className="flex items-center justify-between group animate-in fade-in slide-in-from-right-2">
                    <div className="flex items-center gap-3">
                      <img src={u.avatar} className="w-10 h-10 rounded-full border border-slate-800 object-cover" alt="" />
                      <div className="min-w-0">
                        <p className="font-bold text-sm truncate max-w-[100px]">{u.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">@{u.name?.replace(/\s+/g, '').toLowerCase()}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => onToggleFollow(u.id)}
                      className={`p-2 rounded-xl transition-all active:scale-90 ${
                        isFollowing 
                          ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' 
                          : 'bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-900/20'
                      }`}
                    >
                      {isFollowing ? <UserCheck size={18} /> : <UserPlus size={18} />}
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-500 italic text-center py-4">Wait for others to join the vibe!</p>
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity"><Sparkles className="text-violet-500 animate-pulse" size={40} /></div>
          <div className="flex items-center gap-2 mb-4"><Sparkles size={18} className="text-violet-500" /><h3 className="font-bold text-slate-100">Feed Intelligence</h3></div>
          {loadingSummary ? <div className="space-y-2 animate-pulse"><div className="h-4 bg-slate-800 rounded w-full"></div><div className="h-4 bg-slate-800 rounded w-3/4"></div></div> : <p className="text-sm text-slate-400 leading-relaxed italic">"{summary}"</p>}
        </div>
      </div>

      {activeStoryIndex !== null && <StoryViewer stories={stories} initialIndex={activeStoryIndex} onClose={() => setActiveStoryIndex(null)} />}
      {showStoryCreator && <StoryCreator onClose={() => setShowStoryCreator(false)} onPost={handlePostStory} />}
      {activeReelId && <ReelsViewer reels={reels} initialReelId={activeReelId} onClose={() => setActiveReelId(null)} currentUser={user} />}
    </div>
  );
};

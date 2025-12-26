
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Heart, MessageCircle, Share2, Music, MoreHorizontal, CheckCircle, Send, Copy, Twitter, Facebook, Link as LinkIcon, ChevronUp, ChevronDown, Video } from 'lucide-react';
import { Post, Comment } from '../types';
import { storageService } from '../services/storageService';

interface ReelsViewerProps {
  reels: Post[];
  initialReelId: string;
  onClose: () => void;
  currentUser: any;
}

interface ReelItemProps {
  reel: Post;
  isActive: boolean;
  currentUser: any;
  onUpdateReel: (updatedReel: Post) => void;
}

const ReelItem: React.FC<ReelItemProps> = ({ reel, isActive, currentUser, onUpdateReel }) => {
  const [liked, setLiked] = useState(reel.likedBy?.includes(currentUser.id) || false);
  const [showComments, setShowComments] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [showBigHeart, setShowBigHeart] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync like state if reel object updates from parent
  useEffect(() => {
    setLiked(reel.likedBy?.includes(currentUser.id) || false);
  }, [reel.likedBy, currentUser.id]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      // Play when active
      video.play().catch(e => console.debug("Play prevented", e));
    } else {
      // Pause immediately when not active
      video.pause();
      video.currentTime = 0;
    }
  }, [isActive]);

  const handleLike = async (isDoubleClick = false) => {
    if (isLiking) return;
    
    // If it's a double click and already liked, just show the animation
    if (isDoubleClick && liked) {
      setShowBigHeart(true);
      setTimeout(() => setShowBigHeart(false), 800);
      return;
    }

    // If it's a double click and NOT liked, perform the like
    // If it's a single click, toggle it
    const shouldBeLiked = isDoubleClick ? true : !liked;
    
    if (isDoubleClick) {
      setShowBigHeart(true);
      setTimeout(() => setShowBigHeart(false), 800);
    }

    if (shouldBeLiked === liked && !isDoubleClick) return;

    setIsLiking(true);

    const updatedLikedBy = shouldBeLiked
      ? [...(reel.likedBy || []), currentUser.id]
      : (reel.likedBy || []).filter(id => id !== currentUser.id);

    const updatedReel: Post = {
      ...reel,
      likedBy: updatedLikedBy,
      likes: shouldBeLiked ? (reel.likes + 1) : (reel.likes - 1)
    };

    setLiked(shouldBeLiked);
    onUpdateReel(updatedReel);
    await storageService.updatePost(updatedReel);
    setIsLiking(false);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      author: currentUser.name,
      avatar: currentUser.avatar,
      text: commentText,
      timestamp: new Date().toISOString()
    };

    const updatedReel: Post = {
      ...reel,
      comments: (reel.comments || 0) + 1,
      commentsList: [...(reel.commentsList || []), newComment]
    };

    onUpdateReel(updatedReel);
    setCommentText('');
    await storageService.updatePost(updatedReel);
  };

  return (
    <div className="relative w-full h-full snap-start flex items-center justify-center bg-black overflow-hidden">
      {/* Background Blur */}
      <div className="absolute inset-0 z-0">
        {reel.mediaItems?.[0]?.type === 'video' ? (
          <video src={reel.mediaItems[0].url} className="w-full h-full object-cover blur-3xl opacity-20" muted loop />
        ) : (
          <img src={reel.mediaItems?.[0]?.url} className="w-full h-full object-cover blur-3xl opacity-20" alt="" />
        )}
      </div>

      {/* Heart Animation for Double Tap */}
      {showBigHeart && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <Heart size={120} className="text-white fill-white animate-ping opacity-70" />
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {reel.mediaItems?.[0]?.type === 'video' ? (
          <video
            ref={videoRef}
            src={reel.mediaItems[0].url}
            className="w-full h-full object-contain md:object-cover cursor-pointer"
            loop
            playsInline
            muted={false}
            onDoubleClick={() => handleLike(true)}
            onClick={(e) => {
              if (e.currentTarget.paused) e.currentTarget.play();
              else e.currentTarget.pause();
            }}
          />
        ) : (
          <img 
            src={reel.mediaItems?.[0]?.url} 
            className="w-full h-full object-contain md:object-cover" 
            alt="Reel Content" 
            onDoubleClick={() => handleLike(true)}
          />
        )}

        {/* Overlay - Bottom Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none" />

        {/* UI elements */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 flex flex-col z-20 pointer-events-none">
          <div className="flex items-center gap-3 mb-4 pointer-events-auto">
            <img src={reel.author.avatar} className="w-10 h-10 rounded-full border-2 border-pink-500 object-cover shadow-lg" alt="" />
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-sm shadow-black drop-shadow-md">{reel.author.displayName}</span>
                {reel.author.isVerified && <CheckCircle size={14} className="text-sky-400 fill-sky-400/20" />}
                <button className="text-[10px] font-black uppercase tracking-widest text-white border border-white/30 px-2 py-0.5 rounded ml-2 hover:bg-white/10 backdrop-blur-md transition-colors">Follow</button>
              </div>
            </div>
          </div>
          <p className="text-sm text-white/90 line-clamp-2 mb-4 pr-12 drop-shadow-md pointer-events-auto">{reel.content}</p>
          <div className="flex items-center gap-2 text-white/70">
            <Music size={14} className="animate-spin duration-[4000ms]" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Original Audio • {reel.author.displayName}</span>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-30">
          <button onClick={() => handleLike(false)} className="flex flex-col items-center gap-1 group">
            <div className={`p-3 rounded-full transition-all group-active:scale-125 shadow-lg ${liked ? 'bg-pink-500/20 text-pink-500' : 'bg-black/40 text-white hover:bg-black/60 backdrop-blur-md'}`}>
              <Heart size={26} className={liked ? 'fill-pink-500' : ''} />
            </div>
            <span className="text-[10px] font-black text-white drop-shadow-lg">{reel.likes}</span>
          </button>

          <button onClick={() => setShowComments(true)} className="flex flex-col items-center gap-1 group">
            <div className="p-3 bg-black/40 rounded-full text-white group-active:scale-110 transition-all hover:bg-black/60 backdrop-blur-md shadow-lg">
              <MessageCircle size={26} />
            </div>
            <span className="text-[10px] font-black text-white drop-shadow-lg">{reel.comments}</span>
          </button>

          <button onClick={() => setShowShareOptions(true)} className="flex flex-col items-center gap-1 group">
            <div className="p-3 bg-black/40 rounded-full text-white group-active:scale-110 transition-all hover:bg-black/60 backdrop-blur-md shadow-lg">
              <Share2 size={26} />
            </div>
            <span className="text-[10px] font-black text-white drop-shadow-lg">{reel.shares}</span>
          </button>

          <button className="p-2 text-white/60 hover:text-white transition-colors">
            <MoreHorizontal size={20} />
          </button>

          <div className="w-9 h-9 rounded-lg bg-slate-800 border border-white/20 overflow-hidden mt-4 group cursor-pointer hover:scale-110 transition-transform shadow-xl">
            <img src={reel.author.avatar} className="w-full h-full object-cover" alt="" />
          </div>
        </div>
      </div>

      {/* Internal Comment Drawer */}
      {showComments && (
        <div className="absolute inset-0 z-[60] bg-slate-950/95 animate-in slide-in-from-bottom duration-300 flex flex-col">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400">Comments ({reel.comments})</h3>
            <button onClick={() => setShowComments(false)} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><X size={20} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">
            {reel.commentsList && reel.commentsList.length > 0 ? (
              reel.commentsList.map(comment => (
                <div key={comment.id} className="flex gap-3 animate-in fade-in slide-in-from-left-2">
                  <img src={comment.avatar} className="w-8 h-8 rounded-full border border-slate-700 object-cover" alt="" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[11px] font-bold text-violet-400">{comment.author}</p>
                      <span className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">Viber</span>
                    </div>
                    <p className="text-xs text-slate-200 mt-1 leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full opacity-20 space-y-4">
                <MessageCircle size={48} />
                <p className="text-sm font-bold uppercase tracking-widest">No comments yet</p>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-slate-800 bg-slate-900/50">
            <form onSubmit={handleAddComment} className="flex gap-2 items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
              <input 
                type="text" 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts..." 
                className="bg-transparent border-none focus:ring-0 text-xs flex-1 outline-none text-slate-200"
              />
              <button type="submit" disabled={!commentText.trim()} className="text-violet-500 disabled:text-slate-700 p-1"><Send size={18} /></button>
            </form>
          </div>
        </div>
      )}

      {/* Internal Share Options */}
      {showShareOptions && (
        <div className="absolute inset-0 z-[70] flex items-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowShareOptions(false)} />
          <div className="w-full bg-slate-900 border-t border-slate-800 rounded-t-[32px] p-8 space-y-8 animate-in slide-in-from-bottom relative">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Share Reel</h4>
              <button onClick={() => setShowShareOptions(false)} className="p-2 hover:bg-slate-800 rounded-full"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-4 gap-6">
              <button className="flex flex-col items-center gap-3 group active:scale-90 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-500 group-hover:bg-slate-700 transition-colors"><Facebook size={24} /></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Facebook</span>
              </button>
              <button className="flex flex-col items-center gap-3 group active:scale-90 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400 group-hover:bg-slate-700 transition-colors"><Twitter size={24} /></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Twitter</span>
              </button>
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert("Copied!"); setShowShareOptions(false); }} className="flex flex-col items-center gap-3 group active:scale-90 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-slate-700 transition-colors"><Copy size={24} /></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Link</span>
              </button>
              <button className="flex flex-col items-center gap-3 group active:scale-90 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-violet-500 group-hover:bg-slate-700 transition-colors"><LinkIcon size={24} /></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Vibe Feed</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ReelsViewer: React.FC<ReelsViewerProps> = ({ reels, initialReelId, onClose, currentUser }) => {
  const [localReels, setLocalReels] = useState<Post[]>(reels);
  const [activeIndex, setActiveIndex] = useState(reels.findIndex(r => r.id === initialReelId));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial scroll to the selected reel
    const initialElement = containerRef.current?.children[activeIndex] as HTMLElement;
    if (initialElement) {
      initialElement.scrollIntoView({ behavior: 'auto' });
    }
  }, []);

  const handleUpdateReel = useCallback((updatedReel: Post) => {
    setLocalReels(prev => prev.map(r => r.id === updatedReel.id ? updatedReel : r));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Array.from(containerRef.current?.children || []).indexOf(entry.target);
            if (index !== -1) {
              setActiveIndex(index);
            }
          }
        });
      },
      { 
        threshold: 0.6, // Switch active video when 60% of the next one is visible
        rootMargin: '0px'
      }
    );

    const children = containerRef.current?.children;
    if (children) {
      Array.from(children).forEach((child) => observer.observe(child));
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="fixed inset-0 z-[250] bg-black flex items-center justify-center animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-3xl" />
      
      {/* Desktop Navigation Helper Labels */}
      <div className="hidden lg:flex absolute left-8 top-1/2 -translate-y-1/2 flex-col gap-8 text-white/20 font-black text-xs uppercase tracking-widest pointer-events-none">
        <div className="flex flex-col items-center gap-2">
           <ChevronUp size={24} />
           <span>Scroll Up</span>
        </div>
        <div className="flex flex-col items-center gap-2">
           <span>Scroll Down</span>
           <ChevronDown size={24} />
        </div>
      </div>

      <div className="relative w-full max-w-[450px] h-full md:h-[95vh] bg-black md:rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:border border-slate-800">
        {/* Header - Fixed across all items */}
        <div className="absolute top-0 left-0 right-0 z-[100] p-6 flex justify-between items-center pointer-events-none">
          <div className="p-2 bg-black/20 backdrop-blur-md rounded-xl border border-white/10 flex items-center gap-2 pointer-events-auto">
            <Video className="text-pink-500" size={18} />
            <span className="text-white text-xs font-black uppercase tracking-widest">Vibe Reels</span>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 bg-black/40 text-white rounded-full backdrop-blur-md hover:bg-black/60 transition-colors pointer-events-auto border border-white/10 active:scale-90"
          >
            <X size={24} />
          </button>
        </div>

        {/* Vertical Scroll Container */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-y-scroll snap-y snap-mandatory no-scrollbar h-full w-full bg-black"
        >
          {localReels.map((reel, index) => (
            <ReelItem 
              key={reel.id} 
              reel={reel} 
              isActive={index === activeIndex} 
              currentUser={currentUser} 
              onUpdateReel={handleUpdateReel}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

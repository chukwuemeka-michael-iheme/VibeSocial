
import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, CheckCircle, Send, X, UserPlus, UserCheck, Trash2, AlertTriangle, ChevronLeft, ChevronRight, Smile } from 'lucide-react';
import { Post } from '../types';
import { storageService } from '../services/storageService';

interface PostCardProps {
  post: Post;
  currentUser?: any;
  onToggleFollow?: (userId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, currentUser, onToggleFollow }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [commentCount, setCommentCount] = useState(post.comments);
  const [mediaIndex, setMediaIndex] = useState(0);

  const isFollowing = currentUser?.following?.includes(post.userId);
  const isMe = currentUser?.id === post.userId;

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  };

  const handleSendComment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!commentText.trim()) return;

    const newComment = {
      id: Date.now(),
      text: commentText,
      author: currentUser.name,
      avatar: currentUser.avatar,
      time: 'Just now'
    };

    setComments([...comments, newComment]);
    setCommentCount(prev => prev + 1);
    setCommentText('');
  };

  const handleDelete = async () => {
    await storageService.deletePost(post.id);
  };

  const nextMedia = () => {
    if (post.mediaItems && mediaIndex < post.mediaItems.length - 1) {
      setMediaIndex(mediaIndex + 1);
    }
  };

  const prevMedia = () => {
    if (mediaIndex > 0) {
      setMediaIndex(mediaIndex - 1);
    }
  };

  return (
    <div className={`bg-slate-900/40 md:bg-slate-900/50 border-y md:border border-slate-800/60 md:rounded-2xl overflow-hidden mb-3 md:mb-6 transition-all shadow-xl group/card -mx-3 md:mx-0 ${post.isReel ? 'max-w-md mx-auto ring-2 ring-pink-500/20' : ''}`}>
      <div className="p-3 md:p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={post.author.avatar} className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover border border-slate-800" alt="avatar" />
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-x-1.5">
              <span className="font-bold hover:underline cursor-pointer text-sm">{post.author.displayName}</span>
              {post.author.isVerified && <CheckCircle size={13} className="text-sky-400 fill-sky-400/20" />}
              {post.feeling && (
                <span className="text-slate-400 text-xs font-medium"> is {post.feeling.emoji} feeling <span className="font-bold text-slate-300">{post.feeling.label}</span></span>
              )}
              {post.isReel && <span className="text-[10px] bg-pink-600 text-white px-1.5 py-0.5 rounded font-black uppercase ml-1">Reel</span>}
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
               {post.timestamp === 'Just now' ? post.timestamp : new Date(post.timestamp).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!isMe && onToggleFollow && (
            <button 
              onClick={() => onToggleFollow(post.userId)}
              className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all active:scale-95 border ${
                isFollowing 
                  ? 'bg-transparent border-slate-700 text-slate-400 hover:bg-slate-800' 
                  : 'bg-violet-600 border-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-900/20'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {isFollowing ? (
                  <><UserCheck size={14} /> Following</>
                ) : (
                  <><UserPlus size={14} /> Follow</>
                )}
              </div>
            </button>
          )}

          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="text-slate-500 hover:bg-slate-800 p-2 rounded-xl transition-colors active:scale-90">
              <MoreHorizontal size={18} />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-20 py-2 animate-in fade-in zoom-in-95 duration-200">
                {isMe ? (
                  <button onClick={handleDelete} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-pink-500/10 text-pink-500 text-xs font-bold transition-colors">
                    <Trash2 size={14} /> Delete Vibe
                  </button>
                ) : (
                  <button onClick={() => { setShowMenu(false); alert("Report submitted."); }} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-colors">
                    <AlertTriangle size={14} /> Report Vibe
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-3 md:px-4 pb-3">
        <p className="text-slate-200 whitespace-pre-wrap leading-relaxed text-[13px] md:text-sm">{post.content}</p>
      </div>

      {post.mediaItems && post.mediaItems.length > 0 && (
        <div className="relative group/media px-0 md:px-4 pb-4">
          <div className="relative w-full overflow-hidden md:rounded-2xl border-y md:border border-slate-800/50 shadow-lg bg-black">
            {post.mediaItems[mediaIndex].type === 'video' ? (
              <video 
                src={post.mediaItems[mediaIndex].url} 
                className="w-full h-auto max-h-[600px] object-contain" 
                controls 
                autoPlay={post.isReel}
                loop={post.isReel}
                muted
              />
            ) : (
              <img 
                src={post.mediaItems[mediaIndex].url} 
                className="w-full h-auto object-contain max-h-[600px]" 
                alt={`Media ${mediaIndex + 1}`} 
              />
            )}

            {post.mediaItems.length > 1 && (
              <>
                <button 
                  onClick={prevMedia} 
                  disabled={mediaIndex === 0}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white backdrop-blur-md opacity-0 group-hover/media:opacity-100 transition-opacity disabled:hidden`}
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={nextMedia} 
                  disabled={mediaIndex === post.mediaItems.length - 1}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white backdrop-blur-md opacity-0 group-hover/media:opacity-100 transition-opacity disabled:hidden`}
                >
                  <ChevronRight size={20} />
                </button>
                
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {post.mediaItems.map((_, i) => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === mediaIndex ? 'bg-violet-500 w-3' : 'bg-white/50'}`} />
                  ))}
                </div>

                <div className="absolute top-4 right-4 bg-black/60 px-2.5 py-1 rounded-full text-[10px] font-black text-white backdrop-blur-md border border-white/10">
                  {mediaIndex + 1} / {post.mediaItems.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="px-3 md:px-4 py-2 md:py-3 border-t border-slate-800/40 flex items-center justify-between bg-slate-900/20">
        <div className="flex items-center gap-1 md:gap-4">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all active:scale-75 ${liked ? 'text-pink-500' : 'text-slate-400 hover:text-pink-500'}`}
          >
            <Heart size={20} className={liked ? 'fill-pink-500 animate-in zoom-in-110' : ''} />
            <span className="text-xs font-bold">{likeCount}</span>
          </button>
          
          <button 
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all active:scale-75 ${showComments ? 'text-violet-500 bg-violet-500/5' : 'text-slate-400 hover:text-violet-400'}`}
          >
            <MessageCircle size={20} />
            <span className="text-xs font-bold">{commentCount}</span>
          </button>
          
          <button 
            onClick={() => setShowShare(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-400 hover:text-emerald-400 transition-all active:scale-75"
          >
            <Share2 size={20} />
            <span className="text-xs font-bold">{post.shares}</span>
          </button>
        </div>
      </div>

      {showComments && (
        <div className="px-3 md:px-4 py-4 border-t border-slate-800 bg-slate-950/20 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <form onSubmit={handleSendComment} className="flex gap-2 items-center bg-slate-900 rounded-xl px-3 py-2 border border-slate-800 focus-within:border-violet-500 transition-colors">
            <input 
              type="text" 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..." 
              className="bg-transparent border-none focus:ring-0 text-xs flex-1 outline-none text-slate-200" 
            />
            <button type="submit" className="text-violet-500 p-1 active:scale-75 transition-all">
              <Send size={16} />
            </button>
          </form>

          <div className="space-y-3">
            {comments.map(c => (
              <div key={c.id} className="flex gap-3 animate-in fade-in slide-in-from-left-2">
                <img src={c.avatar} className="w-8 h-8 rounded-full border border-slate-800" alt="" />
                <div className="flex-1 bg-slate-900/50 p-3 rounded-2xl rounded-tl-none border border-slate-800">
                  <p className="text-[11px] font-bold text-slate-300">{c.author}</p>
                  <p className="text-xs text-slate-200 mt-0.5">{c.text}</p>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest py-4">No comments yet. Start the conversation!</p>
            )}
          </div>
        </div>
      )}

      {showShare && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowShare(false)} />
          <div className="bg-slate-900 border border-slate-800 w-full md:max-w-sm rounded-t-[32px] md:rounded-[32px] p-6 shadow-2xl relative animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold">Share Vibes</h3>
              <button onClick={() => setShowShare(false)} className="p-1 hover:bg-slate-800 rounded-lg"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {['Facebook', 'X', 'LinkedIn', 'Copy'].map(platform => (
                <button key={platform} className="flex flex-col items-center gap-2 group active:scale-90 transition-transform">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 group-hover:bg-violet-600/20 flex items-center justify-center border border-slate-700 transition-colors">
                    <Share2 size={20} className="text-slate-400 group-hover:text-violet-500" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{platform}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

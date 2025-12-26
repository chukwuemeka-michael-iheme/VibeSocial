
import React from 'react';
import { Play, Plus, Video } from 'lucide-react';
import { Post } from '../types';

interface ReelsShelfProps {
  reels: Post[];
  user: any;
  onCreateClick: () => void;
  onReelClick: (reel: Post) => void;
}

export const ReelsShelf: React.FC<ReelsShelfProps> = ({ reels, user, onCreateClick, onReelClick }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-pink-500/10 rounded-lg text-pink-500">
            <Video size={20} />
          </div>
          <h3 className="font-bold text-lg">Reels</h3>
        </div>
        <button onClick={onCreateClick} className="text-sm font-bold text-violet-400 hover:underline">Create</button>
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {/* Create Reel Card with Profile Reflection */}
        <div 
          onClick={onCreateClick}
          className="relative flex-shrink-0 w-32 md:w-40 aspect-[9/16] bg-slate-800 rounded-xl overflow-hidden cursor-pointer group border border-slate-800 hover:border-violet-500 transition-all shadow-lg"
        >
          {/* User Profile Reflection Background */}
          <div className="absolute inset-0">
            <img 
              src={user.avatar} 
              className="w-full h-full object-cover opacity-40 group-hover:scale-110 group-hover:opacity-30 transition-all duration-700 blur-[2px]" 
              alt="Profile Reflection" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/20 via-slate-900/60 to-slate-900" />
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform ring-4 ring-slate-900">
                <Plus size={28} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-pink-500 rounded-full border-2 border-slate-900 flex items-center justify-center animate-pulse">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
            </div>
            <div className="text-center px-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white drop-shadow-md">Create Reel</span>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1 opacity-60">Share your vibe</p>
            </div>
          </div>
        </div>

        {/* Reel Items */}
        {reels.map((reel) => (
          <div 
            key={reel.id}
            onClick={() => onReelClick(reel)}
            className="relative flex-shrink-0 w-32 md:w-40 aspect-[9/16] bg-slate-950 rounded-xl overflow-hidden cursor-pointer group shadow-lg border border-slate-800 hover:border-pink-500/50 transition-colors"
          >
            {reel.mediaItems?.[0]?.type === 'video' ? (
              <video 
                src={reel.mediaItems[0].url} 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                muted
                loop
                playsInline
                onMouseOver={(e) => e.currentTarget.play().catch(() => {})}
                onMouseOut={(e) => {
                  e.currentTarget.pause();
                  e.currentTarget.currentTime = 0;
                }}
              />
            ) : (
              <img 
                src={reel.mediaItems?.[0]?.url || 'https://picsum.photos/400/700'} 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                alt="Reel"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
            
            <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
              <div className="flex items-center gap-1 text-white text-[10px] font-bold mb-1">
                <Play size={10} fill="currentColor" />
                {reel.likes + Math.floor(Math.random() * 50)}K
              </div>
              <p className="text-white text-[11px] font-bold truncate">{reel.author.displayName}</p>
            </div>

            <div className="absolute top-3 left-3 pointer-events-none">
              <img src={reel.author.avatar} className="w-8 h-8 rounded-full border-2 border-pink-500 object-cover shadow-lg" alt="" />
            </div>
          </div>
        ))}
        
        {reels.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full w-full py-10 text-slate-600 italic text-xs gap-2">
            <Video size={24} className="opacity-20" />
            No community reels yet.
          </div>
        )}
      </div>
    </div>
  );
};

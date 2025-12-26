
import React from 'react';
import { Plus } from 'lucide-react';

interface StoryCircleProps {
  story?: any;
  isMe?: boolean;
  onClick: () => void;
  onAddClick?: () => void;
}

export const StoryCircle: React.FC<StoryCircleProps> = ({ story, isMe, onClick, onAddClick }) => {
  if (isMe && !story) {
    return (
      <div className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer" onClick={onAddClick}>
        <div className="relative">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-[24px] bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden group-hover:border-violet-500 transition-all">
            <Plus size={24} className="text-slate-400 group-hover:text-violet-500 transition-colors" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-violet-600 rounded-full border-4 border-slate-950 flex items-center justify-center">
            <Plus size={12} className="text-white" />
          </div>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Your Story</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer" onClick={onClick}>
      <div className={`p-1 rounded-[28px] border-2 transition-all ${story.isSeen ? 'border-slate-800' : 'border-violet-500'}`}>
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-[24px] border-2 border-slate-950 overflow-hidden">
          <img 
            src={story.user.avatar} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
            alt={story.user.displayName} 
          />
        </div>
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate w-20 text-center">
        {isMe ? 'Your Story' : story.user.displayName.split(' ')[0]}
      </span>
    </div>
  );
};

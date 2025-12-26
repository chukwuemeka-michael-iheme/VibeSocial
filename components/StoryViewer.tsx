
import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, MoreHorizontal, Send } from 'lucide-react';

interface StoryViewerProps {
  stories: any[];
  initialIndex: number;
  onClose: () => void;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({ stories, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);

  const currentStory = stories[currentIndex];

  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + 1;
      });
    }, 50); // 5 seconds per story

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-3xl" onClick={onClose} />
      
      <div className="relative w-full max-w-md h-full md:h-[85vh] md:aspect-[9/16] bg-slate-900 md:rounded-[40px] overflow-hidden shadow-2xl flex flex-col">
        {/* Progress Bars */}
        <div className="absolute top-4 left-4 right-4 z-50 flex gap-1.5">
          {stories.map((_, i) => (
            <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{ 
                  width: i === currentIndex ? `${progress}%` : i < currentIndex ? '100%' : '0%' 
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-8 left-4 right-4 z-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={currentStory.user.avatar} className="w-10 h-10 rounded-full border border-white/20" alt="" />
            <div>
              <p className="text-sm font-black text-white">{currentStory.user.displayName}</p>
              <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">2h ago</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"><MoreHorizontal size={20} /></button>
            <button onClick={onClose} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 relative group">
          <img src={currentStory.imageUrl} className="w-full h-full object-cover" alt="" />
          
          {/* Navigation Tap Zones */}
          <div className="absolute inset-y-0 left-0 w-1/3 z-40 cursor-pointer" onClick={handlePrev} />
          <div className="absolute inset-y-0 right-0 w-1/3 z-40 cursor-pointer" onClick={handleNext} />
        </div>

        {/* Bottom Input */}
        <div className="absolute bottom-6 left-4 right-4 z-50 flex gap-3">
          <div className="flex-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 flex items-center">
            <input 
              type="text" 
              placeholder="Send message..." 
              className="bg-transparent border-none focus:ring-0 text-sm text-white placeholder:text-white/50 w-full outline-none" 
            />
            <button className="text-white ml-2"><Send size={18} /></button>
          </div>
          <button className="p-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl text-white">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Desktop Controls */}
        <button 
          onClick={handlePrev} 
          className="hidden md:flex absolute -left-16 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full items-center justify-center text-white backdrop-blur-md border border-white/10 transition-all active:scale-90"
          style={{ opacity: currentIndex === 0 ? 0 : 1 }}
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={handleNext} 
          className="hidden md:flex absolute -right-16 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full items-center justify-center text-white backdrop-blur-md border border-white/10 transition-all active:scale-90"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

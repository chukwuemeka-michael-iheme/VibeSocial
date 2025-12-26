
import React, { useState, useRef } from 'react';
import { X, Camera, Image, CheckCircle, Loader2, Sparkles, Send } from 'lucide-react';

interface StoryCreatorProps {
  onClose: () => void;
  onPost: (storyData: any) => void;
}

export const StoryCreator: React.FC<StoryCreatorProps> = ({ onClose, onPost }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShare = () => {
    setIsPosting(true);
    // Instant post for better performance
    onPost({
      id: Math.random().toString(),
      imageUrl: selectedImage,
      isSeen: false,
      isMe: true
    });
    setIsPosting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-6 lg:p-10 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative w-full md:max-w-xl max-h-full md:max-h-[95vh] bg-slate-900 border border-slate-800 md:rounded-[40px] shadow-2xl overflow-y-auto no-scrollbar flex flex-col">
        <div className="sticky top-0 p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/80 backdrop-blur-xl z-20">
          <h2 className="text-xl font-black tracking-tight">Create Vibe Story</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors"><X size={24} /></button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 min-h-[300px]">
          {selectedImage ? (
            <div className="relative w-full aspect-[9/16] max-h-[50vh] md:max-h-[60vh] rounded-[32px] overflow-hidden border border-slate-700 shadow-2xl animate-in zoom-in-95 mx-auto">
              <img src={selectedImage} className="w-full h-full object-cover" alt="Selected" />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-black/60 p-2 rounded-xl text-white backdrop-blur-md border border-white/10 hover:bg-black/80 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <div className="text-center space-y-8 max-w-sm py-10">
              <div className="w-24 h-24 bg-violet-600/10 rounded-[32px] border border-violet-500/20 flex items-center justify-center mx-auto text-violet-500 shadow-[0_0_40px_rgba(139,92,246,0.1)]">
                <Camera size={48} />
              </div>
              <div>
                <h3 className="text-2xl font-black mb-2">Capture the Moment</h3>
                <p className="text-slate-400 font-medium leading-relaxed">Stories only last 24 hours. Share your vibes with your followers instantly.</p>
              </div>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-violet-600 hover:bg-violet-700 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-violet-900/30 transition-all active:scale-95"
                >
                  <Image size={20} />
                  Choose from Gallery
                </button>
              </div>
            </div>
          )}
        </div>

        {selectedImage && (
          <div className="p-6 md:p-8 border-t border-slate-800 flex flex-col gap-4 bg-slate-950/20">
            <button 
              onClick={handleShare}
              disabled={isPosting}
              className="w-full bg-gradient-to-r from-violet-600 to-pink-600 py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-95 disabled:opacity-50"
            >
              {isPosting ? <Loader2 size={24} className="animate-spin" /> : <Send size={20} />}
              {isPosting ? 'POSTING...' : 'SHARE NOW'}
            </button>
          </div>
        )}

        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      </div>
    </div>
  );
};

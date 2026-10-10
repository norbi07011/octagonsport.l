import React, { useState, useEffect } from 'react';
import { MediaItem, REELS_DATA, getLocalizedMediaItem } from '../../data/mediaData';
import { useStore } from '../../context/StoreContext';
import { PRODUCTS, getLocalizedProduct } from '../../data/products';
import { 
  X, 
  Heart, 
  ShoppingBag, 
  Volume2, 
  VolumeX, 
  ChevronUp, 
  ChevronDown, 
  Music, 
  Share2, 
  Play, 
  Pause,
  ArrowRight,
  Eye
} from 'lucide-react';

interface ReelsPlayerModalProps {
  initialReelId: string | null;
  onClose: () => void;
}

export const ReelsPlayerModal: React.FC<ReelsPlayerModalProps> = ({ initialReelId, onClose }) => {
  const { addToCart, navigate, showToast, language, t } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [likesMap, setLikesMap] = useState<Record<string, number>>({});
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (initialReelId) {
      const idx = REELS_DATA.findIndex((r) => r.id === initialReelId);
      if (idx !== -1) setCurrentIndex(idx);
    }
  }, [initialReelId]);

  const rawReel = REELS_DATA[currentIndex] || REELS_DATA[0];
  const currentReel = getLocalizedMediaItem(rawReel, language);

  // Auto-progress simulation for reels
  useEffect(() => {
    setProgress(0);
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0;
        }
        return prev + 2.5;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [currentIndex, isPlaying]);

  if (!initialReelId) return null;

  const currentLikes = likesMap[currentReel.id] ?? currentReel.likes;
  const isLiked = likedMap[currentReel.id] ?? false;

  const handleLike = () => {
    setLikedMap((prev) => ({ ...prev, [currentReel.id]: !isLiked }));
    setLikesMap((prev) => ({
      ...prev,
      [currentReel.id]: isLiked ? currentLikes - 1 : currentLikes + 1,
    }));
    if (!isLiked) {
      showToast(language === 'pl' ? 'Polubiono rolkę!' : language === 'en' ? 'Liked reel!' : 'Reel geliket!');
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % REELS_DATA.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + REELS_DATA.length) % REELS_DATA.length);
  };

  const rawTaggedProduct = PRODUCTS.find((p) => currentReel.taggedProductIds.includes(p.id)) || PRODUCTS[0];
  const taggedProduct = getLocalizedProduct(rawTaggedProduct, language);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/95 backdrop-blur-2xl transition-opacity"
        onClick={onClose}
      />

      {/* 9:16 Vertical Reel Player Container */}
      <div className="relative w-full max-w-sm sm:max-w-md aspect-[9/16] max-h-[92vh] bg-black border border-neutral-800 shadow-2xl z-50 overflow-hidden flex flex-col justify-between">
        {/* Top Progress bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-white/20 z-30">
          <div 
            className="h-full bg-[#D71920] transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Top Floating Controls */}
        <div className="relative p-4 flex items-center justify-between z-30">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-black/70 border border-neutral-700 text-white font-mono text-[10px] rounded flex items-center gap-1">
              <Eye className="w-3 h-3 text-[#D71920]" /> {currentReel.views}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-md hover:bg-black transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-neutral-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-md hover:bg-black transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video simulation layer */}
        <div 
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute inset-0 cursor-pointer overflow-hidden flex items-center justify-center"
        >
          <img
            src={currentReel.thumbnail}
            alt={currentReel.title}
            className={`w-full h-full object-cover filter contrast-125 brightness-80 transition-transform duration-700 ${
              isPlaying ? 'scale-105' : 'scale-100'
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90 pointer-events-none" />

          {/* Pause overlay icon */}
          {!isPlaying && (
            <div className="w-16 h-16 rounded-full bg-black/70 text-white flex items-center justify-center backdrop-blur-md z-20">
              <Play className="w-8 h-8 ml-1" />
            </div>
          )}
        </div>

        {/* Right Floating Actions (Like, Share, Next/Prev) */}
        <div className="absolute right-3 bottom-32 z-30 flex flex-col items-center gap-4">
          {/* Like */}
          <button
            onClick={handleLike}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-colors ${
              isLiked ? 'bg-[#D71920] text-white' : 'bg-black/60 text-white hover:bg-black'
            }`}>
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-white' : ''}`} />
            </div>
            <span className="text-[11px] font-mono text-white mt-1 shadow-xs">
              {currentLikes.toLocaleString()}
            </span>
          </button>

          {/* Share */}
          <button
            onClick={() => {
              navigator.clipboard?.writeText?.(window.location.href);
              showToast(language === 'pl' ? 'Link do rolki skopiowany!' : language === 'en' ? 'Reel link copied!' : 'Link gekopieerd!');
            }}
            className="flex flex-col items-center cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center backdrop-blur-md transition-colors">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-white mt-1 uppercase">Share</span>
          </button>

          {/* Next & Prev Arrows */}
          <div className="flex flex-col gap-1 pt-2">
            <button
              onClick={handlePrev}
              className="w-8 h-8 rounded-full bg-black/70 hover:bg-[#D71920] text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
              title="Previous reel"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="w-8 h-8 rounded-full bg-black/70 hover:bg-[#D71920] text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
              title="Next reel"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bottom Metadata & "Shop This Reel" Overlay */}
        <div className="relative p-4 z-30 bg-gradient-to-t from-black via-black/90 to-transparent space-y-3">
          {/* Athlete & Title */}
          <div>
            <span className="text-[11px] font-mono text-[#D71920] font-bold uppercase tracking-wider block">
              @{currentReel.directorOrAthlete || 'OctagonFighter'}
            </span>
            <h3 className="font-bebas text-xl text-white tracking-wide mt-0.5">
              {currentReel.title}
            </h3>
            <p className="text-xs text-neutral-300 line-clamp-2 mt-0.5 font-body">
              {currentReel.description}
            </p>
          </div>

          {/* Audio sound ticker */}
          <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
            <Music className="w-3.5 h-3.5 text-[#D71920] animate-spin" />
            <span className="truncate">{currentReel.audioTrack || 'Original Combat Audio - Octagon'}</span>
          </div>

          {/* Tagged Product Box */}
          {taggedProduct && (
            <div className="p-2.5 bg-[#141414]/95 border border-neutral-700 flex items-center justify-between gap-3 backdrop-blur-md">
              <img
                src={taggedProduct.images[0]}
                alt={taggedProduct.name}
                className="w-10 h-12 object-cover bg-neutral-900 shrink-0 cursor-pointer"
                onClick={() => {
                  onClose();
                  navigate(`/product/${taggedProduct.slug}`);
                }}
              />
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-mono uppercase bg-[#D71920] text-white px-1.5 py-0.2 rounded-none">
                  {t('media.shopThisReel')}
                </span>
                <p 
                  onClick={() => {
                    onClose();
                    navigate(`/product/${taggedProduct.slug}`);
                  }}
                  className="font-condensed font-bold text-xs text-white truncate mt-0.5 cursor-pointer hover:text-[#D71920]"
                >
                  {taggedProduct.name}
                </p>
                <p className="font-mono text-xs font-bold text-white">
                  €{taggedProduct.price.toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => {
                  addToCart(rawTaggedProduct, rawTaggedProduct.sizes[0]);
                  showToast(`${taggedProduct.name} ${t('fightSystem.addedToCart')}`);
                }}
                className="p-2 bg-[#D71920] hover:bg-[#b01318] text-white rounded shrink-0 transition-colors cursor-pointer"
                title={t('product.addToCart')}
              >
                <ShoppingBag className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

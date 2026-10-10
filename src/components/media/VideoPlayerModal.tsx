import React, { useState, useEffect } from 'react';
import { MediaItem, getLocalizedMediaItem } from '../../data/mediaData';
import { useStore } from '../../context/StoreContext';
import { PRODUCTS, getLocalizedProduct } from '../../data/products';
import { 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  RotateCcw, 
  ShoppingBag, 
  Flame, 
  Heart,
  Share2,
  Film
} from 'lucide-react';

interface VideoPlayerModalProps {
  media: MediaItem | null;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ media: rawMedia, onClose }) => {
  const { addToCart, navigate, showToast, language, t } = useStore();
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(25);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [quality, setQuality] = useState('4K 60FPS');

  const media = rawMedia ? getLocalizedMediaItem(rawMedia, language) : null;

  useEffect(() => {
    if (media) {
      setLikes(media.likes);
      setIsPlaying(true);
      setProgress(15);
    }
  }, [rawMedia]);

  // Simulate video playback progress
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 0.8));
    }, 400);
    return () => clearInterval(interval);
  }, [isPlaying]);

  if (!media) return null;

  const taggedProducts = PRODUCTS.filter((p) => media.taggedProductIds.includes(p.id));

  const handleLike = () => {
    if (!hasLiked) {
      setLikes((l) => l + 1);
      setHasLiked(true);
      showToast(language === 'pl' ? 'Polubiono film!' : language === 'en' ? 'Liked video!' : 'Video geliket!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-[#080808] border border-neutral-800 shadow-2xl z-50 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0F0F0F] border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#D71920] text-white text-[10px] font-mono font-bold uppercase tracking-wider">
              {media.category.toUpperCase()}
            </span>
            <span className="text-xs font-condensed font-bold uppercase text-white truncate max-w-xs sm:max-w-md">
              {media.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard?.writeText?.(window.location.href);
                showToast(language === 'pl' ? 'Link skopiowany!' : language === 'en' ? 'Link copied!' : 'Link gekopieerd!');
              }}
              className="p-1.5 text-neutral-400 hover:text-white transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Canvas Simulation */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden group">
          <img
            src={media.thumbnail}
            alt={media.title}
            className={`w-full h-full object-cover filter contrast-125 brightness-90 transition-transform duration-700 ${isPlaying ? 'scale-105' : 'scale-100'}`}
          />

          {/* Vignette & scanlines overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

          {/* Center Play / Pause Indicator on Click */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
          >
            {!isPlaying && (
              <div className="w-20 h-20 rounded-full bg-[#D71920]/90 text-white flex items-center justify-center shadow-2xl backdrop-blur-xs scale-100 hover:scale-110 transition-transform">
                <Play className="w-8 h-8 ml-1" />
              </div>
            )}
          </button>

          {/* HUD Overlay Badges */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-none">
            <span className="px-2 py-0.5 bg-black/70 border border-neutral-700 text-[#D71920] font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#D71920] animate-ping" /> REC · OCTAGON CINEMA
            </span>
            <span className="px-2 py-0.5 bg-black/70 border border-neutral-700 text-neutral-300 font-mono text-[10px]">
              {media.resolution || '4K UHD'}
            </span>
          </div>

          {/* Custom Media Controls Bar */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 z-20 space-y-2">
            {/* Scrubber Bar */}
            <div 
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                setProgress((clickX / rect.width) * 100);
              }}
              className="w-full h-1.5 bg-neutral-800 rounded-full cursor-pointer relative overflow-hidden group/bar"
            >
              <div 
                className="h-full bg-[#D71920] transition-all duration-100 relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow" />
              </div>
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between text-xs text-white">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="hover:text-[#D71920] transition-colors p-1 cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="hover:text-[#D71920] transition-colors p-1 cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-5 h-5 text-neutral-500" /> : <Volume2 className="w-5 h-5 text-white" />}
                </button>

                <span className="font-mono text-[11px] text-neutral-300">
                  {Math.floor((progress / 100) * 165)}s / {media.duration}
                </span>
              </div>

              <div className="flex items-center gap-3 font-mono text-[11px]">
                {/* Resolution selector */}
                <button
                  onClick={() => setQuality(q => q.includes('4K') ? '1080P PRORES' : '4K 60FPS')}
                  className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded text-[10px] cursor-pointer"
                >
                  {quality}
                </button>

                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    hasLiked ? 'bg-[#D71920] text-white' : 'bg-neutral-800 text-neutral-300 hover:text-white'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-white' : ''}`} />
                  <span>{likes.toLocaleString()}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Pinned Gear "SHOP THE GEAR IN THIS VIDEO" */}
        {taggedProducts.length > 0 && (
          <div className="p-4 sm:p-5 bg-[#0D0D0D] border-t border-neutral-800 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#D71920]" />
                <h4 className="font-bebas text-base sm:text-lg text-white tracking-wider">
                  {t('media.gearInVideo')} ({taggedProducts.length})
                </h4>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">
                PostNL Express 24h
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {taggedProducts.map((rawProd) => {
                const prod = getLocalizedProduct(rawProd, language);
                return (
                  <div
                    key={prod.id}
                    className="bg-[#141414] border border-neutral-800 p-2.5 flex items-center justify-between gap-3 hover:border-neutral-600 transition-colors"
                  >
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-12 h-14 object-cover bg-neutral-900 shrink-0 cursor-pointer"
                      onClick={() => {
                        onClose();
                        navigate(`/product/${prod.slug}`);
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p 
                        onClick={() => {
                          onClose();
                          navigate(`/product/${prod.slug}`);
                        }}
                        className="font-condensed font-bold text-xs text-white truncate cursor-pointer hover:text-[#D71920]"
                      >
                        {prod.name}
                      </p>
                      <p className="font-mono text-xs font-bold text-[#D71920] mt-0.5">
                        €{prod.price.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        addToCart(rawProd, rawProd.sizes[0]);
                        showToast(`${prod.name} ${t('fightSystem.addedToCart')}`);
                      }}
                      className="p-2 bg-[#D71920] hover:bg-[#b01318] text-white rounded shrink-0 transition-colors cursor-pointer"
                      title={t('product.addToCart')}
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

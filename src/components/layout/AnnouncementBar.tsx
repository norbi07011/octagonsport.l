import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { ShieldCheck, Truck, Zap, Award } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  const { t } = useStore();
  const [index, setIndex] = useState(0);

  const messages = [
    { text: t('announcement.shipping'), icon: Truck },
    { text: t('announcement.dispatch'), icon: Zap },
    { text: t('announcement.official'), icon: ShieldCheck }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [messages.length]);

  const CurrentIcon = messages[index].icon;

  return (
    <div className="bg-[#0B0B0B] border-b border-neutral-800/80 text-neutral-300 text-xs py-2 px-4 select-none relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="hidden lg:flex items-center gap-4 text-[11px] text-neutral-400 uppercase tracking-widest font-mono">
          <span>{t('announcement.ideal')}</span>
        </div>

        <div className="flex-1 flex items-center justify-center gap-2 overflow-hidden">
          <CurrentIcon className="w-3.5 h-3.5 text-[#D71920] shrink-0 animate-pulse" />
          <span className="font-condensed font-semibold tracking-wider uppercase text-neutral-100 text-xs sm:text-sm transition-opacity duration-300">
            {messages[index].text}
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-4 text-[11px] text-neutral-400 font-mono">
          <span>shop@octagonsport.nl</span>
        </div>
      </div>
    </div>
  );
};

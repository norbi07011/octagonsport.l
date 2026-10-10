import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  FEATURED_MAIN_FILM, 
  REELS_DATA, 
  COMMERCIALS_LIBRARY, 
  FIGHT_PLAYLISTS,
  MediaItem,
  getLocalizedMediaItem 
} from '../data/mediaData';
import { VideoPlayerModal } from '../components/media/VideoPlayerModal';
import { ReelsPlayerModal } from '../components/media/ReelsPlayerModal';
import { PRODUCTS, getLocalizedProduct } from '../data/products';
import { 
  Play, 
  Film, 
  Flame, 
  Eye, 
  Heart, 
  ShoppingBag, 
  Music, 
  ShieldCheck, 
  ArrowRight, 
  Send, 
  Check 
} from 'lucide-react';

export const MediaPage: React.FC = () => {
  const { navigate, showToast, language, t } = useStore();

  // Active modals
  const [activeVideoModal, setActiveVideoModal] = useState<MediaItem | null>(null);
  const [activeReelId, setActiveReelId] = useState<string | null>(null);

  // Filter for commercials library
  const [activeFilter, setActiveFilter] = useState<'all' | 'commercial' | 'trailer' | 'lab' | 'docu'>('all');

  // Reel submission form state
  const [submissionForm, setSubmissionForm] = useState({
    athleteName: '',
    socialHandle: '',
    gymName: '',
    videoLink: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const localizedMainFilm = getLocalizedMediaItem(FEATURED_MAIN_FILM, language);

  const filteredCommercials = COMMERCIALS_LIBRARY.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.category === activeFilter;
  });

  const handleSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    showToast(t('media.successMsg'));
  };

  return (
    <div className="bg-[#050505] min-h-screen text-white pb-24">
      {/* ========================================================================= */}
      {/* 1. HERO SPOTLIGHT: CINEMATIC CAMPAIGN FILM */}
      {/* ========================================================================= */}
      <section className="relative min-h-[75vh] lg:min-h-[85vh] flex items-end justify-start overflow-hidden border-b border-neutral-800">
        <div className="absolute inset-0 z-0">
          <img
            src={localizedMainFilm.thumbnail}
            alt={localizedMainFilm.title}
            className="w-full h-full object-cover filter brightness-50 contrast-125 scale-100 hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-black/70" />
          <div className="absolute inset-0 bg-radial-vignette opacity-80" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 w-full">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-[#D71920] text-white text-[11px] font-mono font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5" /> {t('media.heroBadge')}
              </span>
              <span className="px-2.5 py-1 bg-black/70 border border-neutral-700 text-neutral-300 text-[11px] font-mono">
                {localizedMainFilm.resolution}
              </span>
              <span className="px-2.5 py-1 bg-black/70 border border-neutral-700 text-neutral-300 text-[11px] font-mono uppercase">
                {localizedMainFilm.views} {t('media.views')}
              </span>
            </div>

            <h1 className="font-bebas text-5xl sm:text-7xl lg:text-8xl tracking-tight text-white uppercase leading-[0.9]">
              {localizedMainFilm.title}
            </h1>

            <p className="text-sm sm:text-base text-neutral-300 font-body leading-relaxed max-w-2xl">
              {localizedMainFilm.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={() => setActiveVideoModal(localizedMainFilm)}
                className="px-8 py-4 bg-[#D71920] hover:bg-[#b01318] text-white font-condensed font-bold text-sm tracking-widest uppercase transition-all duration-200 shadow-2xl shadow-red-950/50 flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-3.5 h-3.5 ml-0.5 fill-black" />
                </div>
                <span>{t('media.watchFilm')} ({localizedMainFilm.duration})</span>
              </button>

              <button
                onClick={() => {
                  const gear = PRODUCTS.find((p) => localizedMainFilm.taggedProductIds.includes(p.id));
                  if (gear) navigate(`/product/${gear.slug}`);
                }}
                className="px-6 py-4 bg-black/80 hover:bg-neutral-900 border border-neutral-700 text-white font-condensed font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-[#D71920]" />
                <span>{t('media.shopGearInFilm')}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. OCTAGON REELS & SHORTS (VERTICAL 9:16 FEED) */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-neutral-800 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D71920] animate-ping" />
              <span className="text-xs font-mono uppercase text-[#D71920] tracking-widest">
                {t('media.reelsSubtitle')}
              </span>
            </div>
            <h2 className="font-bebas text-3xl sm:text-5xl text-white tracking-wide mt-1">
              {t('media.reelsTitle')}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 font-mono">
            {t('media.reelsClickHint')}
          </p>
        </div>

        {/* Reels Horizontal Grid / Reel Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {REELS_DATA.map((rawReel) => {
            const reel = getLocalizedMediaItem(rawReel, language);
            return (
              <div
                key={reel.id}
                onClick={() => setActiveReelId(reel.id)}
                className="group relative aspect-[9/16] bg-[#111111] border border-neutral-800 hover:border-[#D71920] overflow-hidden cursor-pointer flex flex-col justify-between p-3.5 transition-all duration-300 shadow-lg"
              >
                <img
                  src={reel.thumbnail}
                  alt={reel.title}
                  className="absolute inset-0 w-full h-full object-cover filter brightness-70 group-hover:scale-105 group-hover:brightness-85 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/30" />

                {/* Top Meta */}
                <div className="relative z-10 flex items-center justify-between text-[11px] font-mono">
                  <span className="px-2 py-0.5 bg-black/70 backdrop-blur-xs rounded text-white flex items-center gap-1">
                    <Eye className="w-3 h-3 text-[#D71920]" /> {reel.views}
                  </span>
                  <span className="px-1.5 py-0.5 bg-black/60 rounded text-neutral-300 text-[10px]">
                    {reel.duration}
                  </span>
                </div>

                {/* Center Play Icon on Hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <div className="w-12 h-12 rounded-full bg-[#D71920]/90 text-white flex items-center justify-center scale-90 group-hover:scale-100 transition-transform shadow-2xl">
                    <Play className="w-5 h-5 ml-0.5" />
                  </div>
                </div>

                {/* Bottom Meta */}
                <div className="relative z-10 transition-transform duration-300 group-hover:-translate-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#D71920] uppercase font-bold mb-1">
                    <Flame className="w-3.5 h-3.5" /> {reel.directorOrAthlete}
                  </div>
                  <h4 className="font-condensed font-bold text-xs sm:text-sm text-white line-clamp-2 leading-snug">
                    {reel.title}
                  </h4>
                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-neutral-300 font-mono">
                    <span>❤️ {reel.likes.toLocaleString()}</span>
                    <span className="text-[#D71920] underline uppercase">{t('media.shopThisReel')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. COMMERCIAL CAMPAIGNS & TV SPOTS LIBRARY */}
      {/* ========================================================================= */}
      <section className="py-16 bg-[#080808] border-y border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-neutral-800 gap-4">
            <div>
              <span className="text-xs font-mono uppercase text-[#D71920] tracking-widest">
                {t('media.campaignsSubtitle')}
              </span>
              <h2 className="font-bebas text-3xl sm:text-5xl text-white tracking-wide mt-1">
                {t('media.campaignsTitle')}
              </h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 text-xs font-condensed font-bold uppercase tracking-wider">
              {[
                { id: 'all', label: t('media.allVideos') },
                { id: 'commercial', label: t('media.tvCommercials') },
                { id: 'trailer', label: t('media.productFilms') },
                { id: 'lab', label: t('media.durabilityLab') },
                { id: 'docu', label: t('media.miniDocs') }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as any)}
                  className={`px-3.5 py-1.5 border transition-colors cursor-pointer ${
                    activeFilter === tab.id
                      ? 'border-[#D71920] bg-[#D71920] text-white'
                      : 'border-neutral-800 bg-[#121212] text-neutral-400 hover:text-white hover:border-neutral-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Videos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCommercials.map((rawItem) => {
              const item = getLocalizedMediaItem(rawItem, language);
              return (
                <div
                  key={item.id}
                  className="bg-[#0C0C0C] border border-neutral-800 hover:border-neutral-600 transition-all overflow-hidden flex flex-col group"
                >
                  {/* 16:9 Thumbnail Canvas */}
                  <div 
                    onClick={() => setActiveVideoModal(item)}
                    className="relative aspect-video bg-neutral-900 overflow-hidden cursor-pointer flex items-center justify-center"
                  >
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover filter brightness-75 group-hover:scale-105 group-hover:brightness-95 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                    {/* Play Center Bubble */}
                    <div className="w-14 h-14 rounded-full bg-[#D71920]/90 group-hover:bg-[#D71920] text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform z-10">
                      <Play className="w-6 h-6 ml-0.5" />
                    </div>

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2 py-0.5 bg-[#D71920] text-white text-[10px] font-mono font-bold uppercase tracking-wider">
                        {item.category.toUpperCase()}
                      </span>
                      <span className="px-2 py-0.5 bg-black/80 text-neutral-300 text-[10px] font-mono">
                        {item.resolution || '4K'}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 text-[11px] font-mono text-neutral-200 bg-black/80 px-2 py-0.5">
                      {item.duration}
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-1">
                        <span>{item.views} {t('media.views')}</span>
                        <span>{item.year || '2026'}</span>
                      </div>

                      <h3 
                        onClick={() => setActiveVideoModal(item)}
                        className="font-bebas text-xl sm:text-2xl text-white hover:text-[#D71920] transition-colors cursor-pointer"
                      >
                        {item.title}
                      </h3>

                      <p className="text-xs text-neutral-400 mt-1 line-clamp-2 font-body leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Tagged Products in this video */}
                    <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-neutral-400">
                        {t('media.gearInVideo')}: {item.taggedProductIds.length}
                      </span>

                      <button
                        onClick={() => setActiveVideoModal(item)}
                        className="text-xs font-condensed font-bold uppercase text-[#D71920] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>{t('media.watchFilm')}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. DURABILITY LAB EPISODES (IMPACT & LAB TESTING) */}
      {/* ========================================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#0C0C0C] border border-neutral-800 p-8 sm:p-12">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-mono uppercase text-[#D71920] tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> {t('media.labSubtitle')}
            </span>
            <h2 className="font-bebas text-4xl sm:text-5xl text-white uppercase leading-none">
              {t('media.labTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 font-body leading-relaxed">
              {language === 'pl'
                ? 'W naszych testach laboratoryjnych Durability Lab poddajemy rękawice i ochraniacze ekstremalnym próbom: prasy hydrauliczne, ścieralność i 50 000 cykli uderzeń na robotach.'
                : language === 'en'
                ? 'Inside our Durability Lab video series, we subject our fight gloves and shin guards to extreme hydraulic presses, friction testing, and 50,000 pneumatic ram strikes.'
                : 'In onze Durability Lab video-reeks onderwerpen we onze bokshandschoenen en scheenbeschermers aan extreme tests: hydraulische persen en 50.000 pneumatische stootcycli.'}
            </p>

            <ul className="space-y-2 text-xs font-mono text-neutral-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#D71920]" />
                {language === 'pl' ? 'Siła 800 Newtonów (0% deformacji pianki)' : language === 'en' ? '800 Newton strike test (0% foam breakdown)' : '800 Newton stootkrachtmeting (0% foam-deformatie)'}
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#D71920]" />
                {language === 'pl' ? 'Wytrzymałość skóry bydlęcej i nici kevlarowych' : language === 'en' ? 'Cowhide tear resistance & Kevlar stitching' : 'Scheurvastheid volnerf rundleer & kevlar-draad'}
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#D71920]" />
                {language === 'pl' ? 'Odporność na pot i sól fizjologiczną' : language === 'en' ? 'Moisture & salt-sweat degradation resistance' : 'Vocht- & zoutzuurbestendigheid'}
              </li>
            </ul>

            <div className="pt-2">
              <button
                onClick={() => {
                  const labVideo = COMMERCIALS_LIBRARY.find((c) => c.category === 'lab') || COMMERCIALS_LIBRARY[2];
                  setActiveVideoModal(getLocalizedMediaItem(labVideo, language));
                }}
                className="px-6 py-3 bg-[#D71920] hover:bg-[#b01318] text-white font-condensed font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{t('media.watchFilm')} - DURABILITY LAB</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 aspect-video bg-neutral-900 border border-neutral-700 relative overflow-hidden group">
            <img
              src={COMMERCIALS_LIBRARY[2].thumbnail}
              alt="Durability Lab"
              className="w-full h-full object-cover filter contrast-125 brightness-80 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <button
                onClick={() => {
                  const labVideo = COMMERCIALS_LIBRARY.find((c) => c.category === 'lab') || COMMERCIALS_LIBRARY[2];
                  setActiveVideoModal(getLocalizedMediaItem(labVideo, language));
                }}
                className="w-16 h-16 rounded-full bg-[#D71920] flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform cursor-pointer"
              >
                <Play className="w-7 h-7 ml-1" />
              </button>
            </div>
            <div className="absolute bottom-4 left-4 text-xs font-mono text-neutral-300 bg-black/80 px-3 py-1">
              50.000 STRIKES LAB TEST · 1080P PRORES
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. ARENA AUDIO & FIGHT PLAYLISTS */}
      {/* ========================================================================= */}
      <section className="py-16 bg-[#080808] border-y border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono uppercase text-[#D71920] tracking-widest flex items-center justify-center gap-1.5 mb-1">
              <Music className="w-4 h-4" /> {t('media.soundtracksSubtitle')}
            </span>
            <h2 className="font-bebas text-3xl sm:text-5xl text-white tracking-wide">
              {t('media.soundtracksTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-2 font-body">
              {language === 'pl'
                ? 'Oficjalne ścieżki dźwiękowe z naszych reklam oraz playlisty treningowe naszych zawodników na ciężkie sesje sparingowe.'
                : language === 'en'
                ? 'Official commercial soundtracks and curated training playlists from our champion fighters for grueling sparring sessions.'
                : 'De officiële soundtracks uit onze commercials en de trainingsafspeellijsten van onze atleten tijdens zware sparringsessies.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FIGHT_PLAYLISTS.map((pl, idx) => (
              <div
                key={idx}
                className="bg-[#111111] border border-neutral-800 p-6 flex flex-col justify-between hover:border-[#D71920] transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-3">
                    <span className="text-[#D71920] font-bold">PLAYLIST #{idx + 1}</span>
                    <span>{pl.streams}</span>
                  </div>
                  <h3 className="font-bebas text-2xl text-white tracking-wide">
                    {pl.title}
                  </h3>
                  <p className="text-xs text-neutral-400 font-mono mt-1">
                    {pl.genre}
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-2">
                    {pl.tracksCount} · {pl.curator}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between">
                  <button
                    onClick={() => showToast(`Playlist "${pl.title}" Spotify!`)}
                    className="text-xs font-condensed font-bold uppercase text-white hover:text-[#D71920] flex items-center gap-2 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-[#D71920]" />
                    <span>{t('media.listenNow')}</span>
                  </button>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase">
                    Spotify / Apple
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. COMMUNITY REEL SUBMISSION CHALLENGE (€250 VOUCHER) */}
      {/* ========================================================================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <div className="bg-[#0C0C0C] border border-neutral-800 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#D71920]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-mono uppercase text-[#D71920] tracking-widest block mb-2">
              {t('media.submissionSubtitle')}
            </span>
            <h2 className="font-bebas text-3xl sm:text-5xl text-white">
              {t('media.submissionTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-2 font-body">
              {t('media.submissionDesc')}
            </p>
          </div>

          {submitted ? (
            <div className="p-8 bg-neutral-900 border border-emerald-500/50 text-center space-y-3">
              <Check className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="font-bebas text-2xl text-white">
                {language === 'pl' ? 'Zgłoszenie Przyjęte!' : language === 'en' ? 'Submission Successful!' : 'Inzending Succesvol!'}
              </h3>
              <p className="text-xs text-neutral-300">
                {language === 'pl'
                  ? `Dziękujemy ${submissionForm.athleteName}! Nasz zespół zweryfikuje Twoje wideo.`
                  : language === 'en'
                  ? `Thank you ${submissionForm.athleteName}! Our media team will review your clip.`
                  : `Bedankt ${submissionForm.athleteName}! Ons mediateam beoordeelt je clip.`}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmission} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                    {t('media.athleteName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={submissionForm.athleteName}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, athleteName: e.target.value })}
                    placeholder="Semih Kaya"
                    className="w-full bg-[#141414] border border-neutral-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D71920]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                    {t('media.socialHandle')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={submissionForm.socialHandle}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, socialHandle: e.target.value })}
                    placeholder="@semih_mma"
                    className="w-full bg-[#141414] border border-neutral-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D71920]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                    {t('media.gymName')}
                  </label>
                  <input
                    type="text"
                    value={submissionForm.gymName}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, gymName: e.target.value })}
                    placeholder="Fight Academy"
                    className="w-full bg-[#141414] border border-neutral-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D71920]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                    {t('media.videoLink')} *
                  </label>
                  <input
                    type="url"
                    required
                    value={submissionForm.videoLink}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, videoLink: e.target.value })}
                    placeholder="https://www.instagram.com/reel/..."
                    className="w-full bg-[#141414] border border-neutral-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D71920]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#D71920] hover:bg-[#b01318] text-white font-condensed font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-colors mt-2"
              >
                <Send className="w-4 h-4" />
                <span>{t('media.submitBtn')}</span>
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Video Player Modal */}
      {activeVideoModal && (
        <VideoPlayerModal
          media={activeVideoModal}
          onClose={() => setActiveVideoModal(null)}
        />
      )}

      {/* Vertical Reels Player Modal */}
      {activeReelId && (
        <ReelsPlayerModal
          initialReelId={activeReelId}
          onClose={() => setActiveReelId(null)}
        />
      )}
    </div>
  );
};

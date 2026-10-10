import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Award, Shield, Check, Send, Users, Sparkles, PhoneCall } from 'lucide-react';
import { HERO_IMAGE, RASHGUARD_IMAGE } from '../data/productImages';

export const ClubsPage: React.FC = () => {
  const { showToast, language, t } = useStore();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    clubName: '',
    contactPerson: '',
    email: '',
    phone: '',
    athletesCount: '25-50',
    discipline: 'Kickboxing & MMA',
    productsRequired: 'Custom Rashguards & Fight Shorts',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    showToast(
      language === 'pl'
        ? 'Wycena dla klubu przesłana pomyślnie! Odpowiemy w 24 godziny.'
        : language === 'en'
        ? 'Club inquiry received! Our representative will contact you within 24 hours.'
        : 'Clubaanvraag succesvol verzonden! Wij nemen binnen 24 uur contact op.'
    );
  };

  return (
    <div className="bg-[#050505] min-h-screen text-white pb-20">
      {/* Hero Banner */}
      <div className="relative py-20 px-4 sm:px-6 bg-gradient-to-r from-black via-neutral-900 to-[#0A0A0A] border-b border-neutral-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D71920]/20 border border-[#D71920]/50 mb-4">
              <Award className="w-4 h-4 text-[#D71920]" />
              <span className="text-xs font-mono tracking-widest uppercase text-[#D71920] font-bold">
                {t('clubs.tag')}
              </span>
            </div>

            <h1 className="font-bebas text-5xl sm:text-7xl text-white uppercase leading-none">
              {t('clubs.title')}
            </h1>

            <p className="mt-4 text-sm sm:text-base text-neutral-300 leading-relaxed font-body">
              {t('clubs.lead')}
            </p>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="border border-neutral-800 p-3 bg-[#111111]">
                <p className="font-bebas text-2xl text-[#D71920]">{t('clubs.benefit1Title')}</p>
                <p className="text-xs text-neutral-400 mt-1">{t('clubs.benefit1Desc')}</p>
              </div>
              <div className="border border-neutral-800 p-3 bg-[#111111]">
                <p className="font-bebas text-2xl text-white">{t('clubs.benefit2Title')}</p>
                <p className="text-xs text-neutral-400 mt-1">{t('clubs.benefit2Desc')}</p>
              </div>
            </div>
          </div>

          <div className="relative aspect-[4/3] bg-neutral-900 border border-neutral-800 overflow-hidden shadow-2xl">
            <img
              src={RASHGUARD_IMAGE}
              alt="Club Fightwear"
              className="w-full h-full object-cover filter contrast-125 brightness-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 p-4 bg-black/80 border border-neutral-700 backdrop-blur-xs flex items-center justify-between">
              <div>
                <p className="font-bebas text-xl text-white">150+ AFFILIATE GYMS</p>
                <p className="text-xs text-neutral-400 font-mono">NL, BE, PL, DE Official Combat Partner</p>
              </div>
              <Shield className="w-8 h-8 text-[#D71920]" />
            </div>
          </div>
        </div>
      </div>

      {/* Inquiry Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-[#0C0C0C] border border-neutral-800 p-8 sm:p-12 shadow-2xl">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-mono uppercase text-[#D71920] tracking-widest block mb-1">
              B2B / GYM PARTNERSHIP
            </span>
            <h2 className="font-bebas text-3xl sm:text-5xl text-white">
              {t('clubs.inquiryTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-2 font-body">
              {language === 'pl'
                ? 'Wypełnij poniższy formularz. Nasz doradca przygotuje bezpłatną kalkulację i wizualizację odzieży w barwach Twojego klubu.'
                : language === 'en'
                ? 'Fill out the form below. Our fightwear specialist will prepare a customized quote and 3D digital mockup for your academy.'
                : 'Vul onderstaand formulier in. Onze clubspecialist maakt een vrijblijvend voorstel en digitaal 3D clubontwerp.'}
            </p>
          </div>

          {submitted ? (
            <div className="p-8 bg-neutral-900 border border-emerald-500/50 text-center space-y-3">
              <Check className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="font-bebas text-2xl text-white">
                {language === 'pl' ? 'Zapytanie Zostało Wysłane!' : language === 'en' ? 'Inquiry Submitted!' : 'Aanvraag Verzonden!'}
              </h3>
              <p className="text-xs text-neutral-300">
                {language === 'pl'
                  ? `Dziękujemy ${formData.contactPerson} (${formData.clubName}). Skontaktujemy się telefonicznie lub mailowo.`
                  : language === 'en'
                  ? `Thank you ${formData.contactPerson} (${formData.clubName}). We will reach out within 24 hours.`
                  : `Bedankt ${formData.contactPerson} (${formData.clubName}). Wij nemen spoedig contact op.`}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                    {t('clubs.clubName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.clubName}
                    onChange={e => setFormData({ ...formData, clubName: e.target.value })}
                    placeholder="Fight Club Amsterdam"
                    className="w-full bg-[#141414] border border-neutral-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D71920]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                    {t('clubs.contactPerson')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Sem Schilt"
                    className="w-full bg-[#141414] border border-neutral-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D71920]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                    {t('checkout.email')} *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="info@fightclub.nl"
                    className="w-full bg-[#141414] border border-neutral-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D71920]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                    {t('contact.phone')} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+31 6 12345678"
                    className="w-full bg-[#141414] border border-neutral-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D71920]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                    {t('clubs.membersCount')}
                  </label>
                  <select
                    value={formData.athletesCount}
                    onChange={e => setFormData({ ...formData, athletesCount: e.target.value })}
                    className="w-full bg-[#141414] border border-neutral-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D71920]"
                  >
                    <option value="10-25">10 - 25</option>
                    <option value="25-50">25 - 50</option>
                    <option value="50-100">50 - 100</option>
                    <option value="100+">100+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                    {t('media.discipline')}
                  </label>
                  <input
                    type="text"
                    value={formData.discipline}
                    onChange={e => setFormData({ ...formData, discipline: e.target.value })}
                    placeholder="Kickboxing, MMA, BJJ"
                    className="w-full bg-[#141414] border border-neutral-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D71920]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                  {t('contact.msgLabel')}
                </label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  placeholder={language === 'pl' ? 'Podaj szczegóły dotyczące nakładu, terminów lub preferowanych barw...' : language === 'en' ? 'Provide details about expected order volume, deadlines, or preferred colors...' : 'Geef aan welke artikelen je zoekt (bv. 50 rashguards en 30 paar scheenbeschermers)...'}
                  className="w-full bg-[#141414] border border-neutral-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D71920]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#D71920] hover:bg-[#b01318] text-white font-condensed font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-colors mt-2"
              >
                <Send className="w-4 h-4" />
                <span>{t('clubs.submitBtn')}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

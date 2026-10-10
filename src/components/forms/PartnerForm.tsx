import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { submitForm } from '../../lib/forms';
import { openWhatsApp, WHATSAPP_NUMBER } from '../layout/WhatsAppWidget';

type L = 'nl' | 'en' | 'pl';

const TYPES: { id: string; label: Record<L, string> }[] = [
  { id: 'sportschool', label: { nl: 'Sportschool / club', en: 'Gym / club', pl: 'Klub / sala treningowa' } },
  { id: 'creator', label: { nl: 'Influencer / creator', en: 'Influencer / creator', pl: 'Influencer / twórca' } },
  { id: 'trainer', label: { nl: 'Trainer / vechter', en: 'Coach / fighter', pl: 'Trener / zawodnik' } },
  { id: 'bedrijf', label: { nl: 'Bedrijf / winkel', en: 'Business / shop', pl: 'Firma / sklep' } },
  { id: 'event', label: { nl: 'Evenement / gala', en: 'Event / fight night', pl: 'Wydarzenie / gala' } },
  { id: 'anders', label: { nl: 'Iets anders', en: 'Something else', pl: 'Coś innego' } },
];

const inputCls =
  'w-full bg-[#121212] border border-neutral-800 px-3 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#D71920] transition-colors';

/** Formularz zgłoszenia do współpracy (podstrona Partnerzy) – wysyłka przez Netlify Forms. */
export const PartnerForm: React.FC<{ lang: L }> = ({ lang }) => {
  const tr = (nl: string, en: string, pl: string) => (lang === 'pl' ? pl : lang === 'en' ? en : nl);
  const [f, setF] = useState({ type: 'sportschool', name: '', organisation: '', email: '', phone: '', city: '', social: '', message: '' });
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF(prev => ({ ...prev, [k]: e.target.value }));

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const typeLabel = TYPES.find(t => t.id === f.type)?.label[lang] || f.type;
    const row = (label: string, value: string) => (value.trim() ? [`${label}: ${value.trim()}`] : []);
    const lines = [
      `*${tr('Partner aanmelding', 'Partner application', 'Zgłoszenie do współpracy')} – OctagonSportNL*`,
      '',
      ...row(tr('Ik ben', 'I am', 'Jestem'), typeLabel),
      ...row(tr('Naam', 'Name', 'Imię i nazwisko'), f.name),
      ...row(tr('Club / bedrijf / kanaal', 'Club / business / channel', 'Klub / firma / kanał'), f.organisation),
      ...row('E-mail', f.email),
      ...row(tr('Telefoon', 'Phone', 'Telefon'), f.phone),
      ...row(tr('Plaats', 'City', 'Miasto'), f.city),
      ...row('Instagram / www', f.social),
      '',
      f.message.trim(),
    ];
    // WhatsApp otwieramy od razu w kliknięciu, żeby przeglądarka nie zablokowała okna.
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
    // Kopia zapasowa zgłoszenia w Netlify Forms (w tle, bez blokowania).
    void submitForm('partner', { ...f, type: TYPES.find(t => t.id === f.type)?.label.nl || f.type, language: lang });
    setState('sent');
  };

  if (state === 'sent') {
    return (
      <div className="border border-emerald-500/40 bg-emerald-500/5 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
        <p className="mt-3 font-bebas text-3xl tracking-wide">{tr('Bijna klaar!', 'Almost done!', 'Prawie gotowe!')}</p>
        <p className="mt-2 text-sm text-neutral-300">
          {tr(
            'WhatsApp is geopend met je aanmelding. Druk daar op "Verzenden" – daarna nemen we zo snel mogelijk contact met je op.',
            'WhatsApp has opened with your application. Tap "Send" there – we will get back to you as soon as possible.',
            'Otworzył się WhatsApp z Twoim zgłoszeniem. Kliknij tam „Wyślij” – odezwiemy się najszybciej, jak to możliwe.'
          )}
        </p>
        <button type="button" onClick={() => setState('idle')} className="mt-4 text-xs font-mono uppercase tracking-wider text-neutral-400 underline hover:text-white">
          {tr('WhatsApp niet geopend? Probeer opnieuw', 'WhatsApp did not open? Try again', 'WhatsApp się nie otworzył? Spróbuj ponownie')}
        </button>
      </div>
    );
  }

  const label = (text: string, req = false) => (
    <span className="mb-1.5 block text-[10px] font-mono uppercase tracking-wider text-neutral-400">
      {text} {req && <span className="text-[#D71920]">*</span>}
    </span>
  );

  return (
    <form onSubmit={send} className="space-y-4 border border-neutral-800 bg-[#0B0B0B] p-5 sm:p-6">
      <div>
        {label(tr('Ik ben', 'I am', 'Jestem'), true)}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {TYPES.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setF(prev => ({ ...prev, type: t.id }))}
              className={`px-2 py-2.5 text-[11px] font-condensed font-bold uppercase tracking-wider border transition-colors ${
                f.type === t.id ? 'border-[#D71920] bg-[#D71920]/10 text-white' : 'border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {t.label[lang]}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">{label(tr('Naam', 'Name', 'Imię i nazwisko'), true)}<input required value={f.name} onChange={set('name')} autoComplete="name" className={inputCls} /></label>
        <label className="block">{label(tr('Club / bedrijf / kanaal', 'Club / business / channel', 'Klub / firma / kanał'))}<input value={f.organisation} onChange={set('organisation')} className={inputCls} /></label>
        <label className="block">{label('E-mail', true)}<input required type="email" value={f.email} onChange={set('email')} autoComplete="email" className={inputCls} /></label>
        <label className="block">{label(tr('Telefoon / WhatsApp', 'Phone / WhatsApp', 'Telefon / WhatsApp'))}<input type="tel" value={f.phone} onChange={set('phone')} autoComplete="tel" className={inputCls} /></label>
        <label className="block">{label(tr('Plaats', 'City', 'Miasto'))}<input value={f.city} onChange={set('city')} className={inputCls} /></label>
        <label className="block">{label(tr('Instagram / website', 'Instagram / website', 'Instagram / strona'))}<input value={f.social} onChange={set('social')} placeholder="@..." className={inputCls} /></label>
      </div>
      <label className="block">
        {label(tr('Vertel kort over jezelf en het idee', 'Tell us briefly about you and your idea', 'Napisz krótko o sobie i pomyśle'), true)}
        <textarea required rows={4} value={f.message} onChange={set('message')} className={`${inputCls} resize-none`} />
      </label>
      {state === 'error' && (
        <p className="border border-[#D71920]/50 bg-[#D71920]/10 p-3 text-xs text-red-200">
          {tr('Versturen is mislukt. Probeer het opnieuw of stuur ons een WhatsApp-bericht.', 'Sending failed. Please try again or send us a WhatsApp message.', 'Nie udało się wysłać. Spróbuj ponownie albo napisz na WhatsApp.')}{' '}
          <button type="button" onClick={() => openWhatsApp({ topic: 'other' })} className="underline">WhatsApp</button>
        </p>
      )}
      <button
        type="submit"
        disabled={state === 'sending'}
        className="flex w-full items-center justify-center gap-2 bg-[#D71920] py-4 font-condensed text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#b01318] disabled:opacity-60"
      >
        <Send className="h-4 w-4" />
        {tr('Versturen via WhatsApp', 'Send via WhatsApp', 'Wyślij przez WhatsApp')}
      </button>
    </form>
  );
};

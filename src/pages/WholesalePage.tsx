import React, { useState } from 'react';
import { submitForm } from '../lib/forms';
import { useStore } from '../context/StoreContext';
import { Building2, Check, Send } from 'lucide-react';

export const WholesalePage: React.FC = () => {
  const { showToast, language, t } = useStore();

  // Form state
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    company: '',
    kvk: '',
    vat: '',
    address: '',
    website: '',
    contactPerson: '',
    phone: '',
    email: '',
    volume: '€2.500 - €5.000',
    message: ''
  });

  const [sending, setSending] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    const ok = await submitForm('wholesale', { ...form, language });
    setSending(false);
    if (ok) {
      setSubmitted(true);
      showToast(
        language === 'pl'
          ? 'Wniosek B2B wysłany! Odezwiemy się najszybciej, jak to możliwe.'
          : language === 'en'
          ? 'B2B application sent! We will get back to you as soon as possible.'
          : 'B2B-aanvraag verzonden! We nemen zo snel mogelijk contact met je op.'
      );
    } else {
      showToast(
        language === 'pl'
          ? 'Nie udało się wysłać. Spróbuj ponownie albo napisz na WhatsApp / shop@octagonsport.nl.'
          : language === 'en'
          ? 'Sending failed. Please try again or contact us via WhatsApp / shop@octagonsport.nl.'
          : 'Versturen is mislukt. Probeer het opnieuw of neem contact op via WhatsApp / shop@octagonsport.nl.'
      );
    }
  };


  return (
    <div className="bg-[#050505] min-h-screen text-white pb-24">
      <div className="bg-[#0A0A0A] border-b border-neutral-800 py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-950/40 border border-red-800/60 mb-4">
            <Building2 className="w-4 h-4 text-[#D71920]" />
            <span className="text-xs font-mono tracking-widest uppercase text-red-300 font-bold">B2B</span>
          </div>
          <h1 className="font-bebas text-5xl sm:text-7xl text-white uppercase leading-none">
            {t('wholesale.title')}
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-neutral-400 max-w-2xl mx-auto font-body leading-relaxed">
            {t('wholesale.lead')}
          </p>
        </div>
      </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
          <div className="bg-[#0C0C0C] border border-neutral-800 p-8 sm:p-12 shadow-2xl">
            <div className="text-center max-w-xl mx-auto mb-8">
              <h2 className="font-bebas text-3xl sm:text-5xl text-white">
                {t('wholesale.submitBtn')}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-2 font-body">
                {language === 'pl'
                  ? 'Wypełnij formularz rejestracji biznesowej B2B. Po weryfikacji NIP/VAT otrzymasz dostęp do cen hurtowych dla klubów, dojo i sklepów w Holandii.'
                  : language === 'en'
                  ? 'Complete the wholesale registration form. Once verified, your account manager will grant direct B2B pricing portal access.'
                  : 'Vul onderstaand B2B aanvraagformulier in. Na controle van je gegevens ontvang je direct toegang tot ons groothandelsportaal.'}
              </p>
            </div>

            {submitted ? (
              <div className="p-8 bg-neutral-900 border border-emerald-500/50 text-center space-y-3">
                <Check className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="font-bebas text-2xl text-white">
                  {language === 'pl' ? 'Wniosek B2B Został Złożony!' : language === 'en' ? 'B2B Request Submitted!' : 'Aanvraag Ontvangen!'}
                </h3>
                <p className="text-xs text-neutral-300">
                  {language === 'pl'
                    ? `Dziękujemy ${form.contactPerson} (${form.company}). Odezwiemy się najszybciej, jak to możliwe.`
                    : language === 'en'
                    ? `Thank you ${form.contactPerson} (${form.company}). We will get back to you as soon as possible.`
                    : `Bedankt ${form.contactPerson} (${form.company}). We nemen spoedig contact met je op.`}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                      {t('wholesale.companyName')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.company}
                      onChange={e => setForm({ ...form, company: e.target.value })}
                      placeholder="Fight Gear Benelux B.V."
                      className="w-full bg-[#141414] border border-neutral-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D71920]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                      {t('wholesale.kvk')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.kvk}
                      onChange={e => setForm({ ...form, kvk: e.target.value })}
                      placeholder="12345678"
                      className="w-full bg-[#141414] border border-neutral-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D71920]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                      {t('wholesale.vat')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.vat}
                      onChange={e => setForm({ ...form, vat: e.target.value })}
                      placeholder="NL123456789B01 / PL1234567890"
                      className="w-full bg-[#141414] border border-neutral-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D71920]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                      Website / Webshop
                    </label>
                    <input
                      type="url"
                      value={form.website}
                      onChange={e => setForm({ ...form, website: e.target.value })}
                      placeholder="https://jouwwinkel.nl"
                      className="w-full bg-[#141414] border border-neutral-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D71920]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                      {t('clubs.contactPerson')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.contactPerson}
                      onChange={e => setForm({ ...form, contactPerson: e.target.value })}
                      placeholder="Lars de Boer"
                      className="w-full bg-[#141414] border border-neutral-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D71920]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                      {t('checkout.email')} *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="inkoop@jouwwinkel.nl"
                      className="w-full bg-[#141414] border border-neutral-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D71920]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                      {t('contact.phone')} *
                    </label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      placeholder="+31 20 1234567"
                      className="w-full bg-[#141414] border border-neutral-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D71920]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                      {language === 'pl' ? 'Szacowany Kwartalny Wolumen' : language === 'en' ? 'Estimated Quarterly Volume' : 'Verwacht Kwartaalvolume'}
                    </label>
                    <select
                      value={form.volume}
                      onChange={e => setForm({ ...form, volume: e.target.value })}
                      className="w-full bg-[#141414] border border-neutral-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D71920]"
                    >
                      <option value="€1.000 - €2.500">€1.000 - €2.500</option>
                      <option value="€2.500 - €5.000">€2.500 - €5.000</option>
                      <option value="€5.000 - €10.000">€5.000 - €10.000</option>
                      <option value="€10.000+">€10.000+</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="disabled:opacity-60 w-full py-4 bg-[#D71920] hover:bg-[#b01318] text-white font-condensed font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-colors mt-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{t('wholesale.submitBtn')}</span>
                </button>
              </form>
            )}
          </div>
        </div>
    </div>
  );
};

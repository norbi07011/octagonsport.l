import React, { useState } from 'react';
import { submitForm } from '../lib/forms';
import { openWhatsApp, WhatsAppIcon } from '../components/layout/WhatsAppWidget';
import { COMPANY } from '../config/company';
import { useStore } from '../context/StoreContext';
import { Mail, Phone, MapPin, Clock, Send, Check } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { showToast, language, t } = useStore();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'support',
    orderNumber: '',
    message: ''
  });

  const [sending, setSending] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    const ok = await submitForm('contact', { ...formData, language });
    setSending(false);
    if (ok) {
      setSubmitted(true);
      showToast(
        t('contact.sentSuccess')
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

  const departments = [
    { id: 'support', label: t('dept.support') },
    { id: 'orders', label: t('dept.orders') },
    { id: 'returns', label: t('dept.returns') },
    { id: 'clubs', label: t('dept.clubs') },
    { id: 'wholesale', label: t('dept.wholesale') },
    { id: 'marketing', label: t('dept.marketing') }
  ];

  return (
    <div className="bg-[#050505] min-h-screen text-white pb-20">
      {/* Header */}
      <div className="bg-[#0A0A0A] border-b border-neutral-800 py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-mono uppercase text-[#D71920] tracking-widest block mb-1">
            {t('contact.tag')}
          </span>
          <h1 className="font-bebas text-4xl sm:text-6xl text-white uppercase">
            {t('contact.title')}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto font-body">
            {t('contact.lead')}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Direct Support Info (4 Cols) */}
          <div className="md:col-span-4 bg-[#0C0C0C] border border-neutral-800 p-6 space-y-6">
            <h3 className="font-bebas text-xl text-white tracking-wider pb-3 border-b border-neutral-800">
              {language === 'pl' ? 'BEZPOŚREDNI KONTAKT' : language === 'en' ? 'DIRECT CONTACT' : 'DIRECT CONTACT'}
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#D71920] shrink-0 mt-0.5" />
                <div>
                  <p className="font-condensed font-bold uppercase text-white">{t('contact.phone')}</p>
                  <p className="text-neutral-400 font-mono mt-0.5">{COMPANY.phone}</p>
                  <button
                    type="button"
                    onClick={() => openWhatsApp({ topic: 'order' })}
                    className="mt-2 inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5b] px-3 py-2 text-[11px] font-condensed font-bold uppercase tracking-wider text-white"
                  >
                    <WhatsAppIcon className="w-4 h-4" /> WhatsApp
                  </button>
                  <p className="text-[11px] text-neutral-500">{t('contact.hoursValue')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#D71920] shrink-0 mt-0.5" />
                <div>
                  <p className="font-condensed font-bold uppercase text-white">{t('contact.email')}</p>
                  <p className="text-neutral-400 font-mono mt-0.5"><a href={`mailto:${COMPANY.email}`} className="hover:text-white">{COMPANY.email}</a></p>
                  <p className="text-[11px] text-neutral-500">
                    {language === 'pl' ? 'Odpowiadamy najszybciej, jak to możliwe' : language === 'en' ? 'We reply as soon as possible' : 'We reageren zo snel mogelijk'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#D71920] shrink-0 mt-0.5" />
                <div>
                  <p className="font-condensed font-bold uppercase text-white">{t('contact.warehouse')}</p>
                  <p className="text-neutral-400 font-mono mt-0.5">
                    {COMPANY.name}<br />
                    {COMPANY.street}<br />
                    {COMPANY.postalCode} {COMPANY.city}, {COMPANY.country[language as 'nl' | 'en' | 'pl'] ?? COMPANY.country.nl}<br />
                    <span className="text-neutral-500">KvK: {COMPANY.kvk} · BTW: {COMPANY.btw}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#D71920] shrink-0 mt-0.5" />
                <div>
                  <p className="font-condensed font-bold uppercase text-white">
                    {language === 'pl' ? 'Czas dostawy' : language === 'en' ? 'Delivery time' : 'Levertijd'}
                  </p>
                  <p className="text-neutral-400 mt-0.5">
                    {language === 'pl'
                      ? 'Dostawa do Holandii trwa 7–10 dni roboczych. Po wysyłce dostaniesz numer śledzenia przesyłki.'
                      : language === 'en'
                      ? 'Delivery to the Netherlands takes 7–10 business days. You will receive a tracking code once your order ships.'
                      : 'Levering in Nederland duurt 7–10 werkdagen. Na verzending ontvang je een Track & Trace-code.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form (8 Cols) */}
          <div className="md:col-span-8 bg-[#0C0C0C] border border-neutral-800 p-8 shadow-2xl">
            {submitted ? (
              <div className="p-8 bg-neutral-900 border border-emerald-500/50 text-center space-y-4">
                <Check className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="font-bebas text-3xl text-white">
                  {language === 'pl' ? 'Wiadomość Wysłana!' : language === 'en' ? 'Message Received!' : 'Bericht Verzonden!'}
                </h3>
                <p className="text-xs text-neutral-300 max-w-md mx-auto">
                  {language === 'pl'
                    ? `Dziękujemy ${formData.name}. Nasz zespół obsługi klienta odpowie najszybciej jak to możliwe.`
                    : language === 'en'
                    ? `Thank you ${formData.name}. Our athlete support team will respond as soon as possible.`
                    : `Bedankt ${formData.name}. Ons support team neemt zo snel mogelijk contact met je op.`}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="font-bebas text-2xl text-white tracking-wider pb-2 border-b border-neutral-800">
                  {t('contact.formTitle')}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                      {t('contact.nameLabel')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
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
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="lars@vechtsport.nl"
                      className="w-full bg-[#141414] border border-neutral-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D71920]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                      {t('contact.deptLabel')}
                    </label>
                    <select
                      value={formData.department}
                      onChange={e => setFormData({ ...formData, department: e.target.value })}
                      className="w-full bg-[#141414] border border-neutral-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D71920]"
                    >
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                      {t('contact.orderNumLabel')}
                    </label>
                    <input
                      type="text"
                      value={formData.orderNumber}
                      onChange={e => setFormData({ ...formData, orderNumber: e.target.value })}
                      placeholder="Bijv. OCT-849201"
                      className="w-full bg-[#141414] border border-neutral-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D71920]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                    {t('contact.msgLabel')} *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    placeholder={language === 'pl' ? 'Opisz swoje pytanie lub sprawę...' : language === 'en' ? 'Describe your question or inquiry...' : 'Beschrijf je vraag over maatvoering, bestelling of samenwerking...'}
                    className="w-full bg-[#141414] border border-neutral-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D71920]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="disabled:opacity-60 w-full py-4 bg-[#D71920] hover:bg-[#b01318] text-white font-condensed font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-colors mt-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{t('contact.sendBtn')}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

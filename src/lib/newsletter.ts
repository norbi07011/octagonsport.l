// Zapis do newslettera przez Netlify Forms (formularz „newsletter” zadeklarowany w index.html).
// Adresy widać w Netlify → Forms → newsletter (trzeba raz włączyć „Form detection”).
export async function subscribeNewsletter(email: string, source: string, lang: string): Promise<boolean> {
  const body = new URLSearchParams({ 'form-name': 'newsletter', email: email.trim(), source, lang, 'bot-field': '' });
  try {
    const r = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() });
    return r.ok;
  } catch {
    return false;
  }
}

export const NEWSLETTER_ERROR: Record<string, string> = {
  nl: 'Inschrijven lukte niet. Probeer het later opnieuw.',
  en: 'Subscribing failed. Please try again later.',
  pl: 'Nie udało się zapisać. Spróbuj ponownie później.',
};

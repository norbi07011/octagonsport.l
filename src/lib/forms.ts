// =====================================================================
// Wysyłka formularzy przez Netlify Forms (bez własnego serwera).
// Zgłoszenia widać w Netlify → Forms; powiadomienia mailem ustawia się
// w Netlify → Site configuration → Notifications → Form submission notifications.
// Nazwy formularzy i pól muszą być też zadeklarowane w index.html (ukryte formularze),
// żeby Netlify je wykrył przy budowaniu.
// =====================================================================
export type FormName = 'contact' | 'clubs' | 'wholesale' | 'partner';

export async function submitForm(name: FormName, data: Record<string, string>): Promise<boolean> {
  const body = new URLSearchParams({ 'form-name': name, 'bot-field': '', ...data });
  try {
    const res = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    return res.ok;
  } catch {
    return false;
  }
}

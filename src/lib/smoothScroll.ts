/*
 * Płynne przewijanie z bezwładnością (jak Lenis) – tylko komputer z myszką/touchpadem.
 * Telefon zostaje przy natywnym przewijaniu systemu (najlepsze na dotyk).
 * Nie przejmuje kółka, gdy kursor jest nad przewijalnym elementem (koszyk, menu, okna),
 * przy zoomie (Ctrl + kółko), przy zablokowanym scrollu strony i przy ograniczonym ruchu.
 */
export function initSmoothScroll(): () => void {
  if (typeof window === 'undefined') return () => {};
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return () => {};
  if (!window.matchMedia?.('(hover: hover) and (pointer: fine)').matches) return () => {};

  const root = document.documentElement;
  let target = window.scrollY;
  let current = window.scrollY;
  let lastSet = current;
  let animating = false;
  let raf = 0;

  const maxScroll = () => root.scrollHeight - window.innerHeight;

  const canScrollInside = (start: EventTarget | null, dy: number) => {
    for (let n = start instanceof Element ? start : null; n && n !== document.body && n !== root; n = n.parentElement) {
      if (n instanceof HTMLElement && n.dataset.nativeScroll !== undefined) return true;
      const oy = getComputedStyle(n).overflowY;
      if ((oy === 'auto' || oy === 'scroll') && n.scrollHeight > n.clientHeight + 1) {
        if (dy > 0 ? n.scrollTop + n.clientHeight < n.scrollHeight - 1 : n.scrollTop > 0) return true;
      }
    }
    return false;
  };

  const tick = () => {
    // ktoś inny przewinął stronę (klawiatura, kod, pasek przewijania) – oddajemy mu kontrolę
    if (Math.abs(window.scrollY - lastSet) > 40) {
      animating = false;
      target = current = lastSet = window.scrollY;
      return;
    }
    current += (target - current) * 0.11;
    if (Math.abs(target - current) < 0.4) { current = target; animating = false; }
    lastSet = Math.round(current * 100) / 100;
    window.scrollTo(0, current);
    lastSet = window.scrollY;
    if (animating) raf = requestAnimationFrame(tick);
  };

  const onWheel = (e: WheelEvent) => {
    if (e.ctrlKey || e.defaultPrevented) return;
    const bodyLocked = getComputedStyle(document.body).overflow === 'hidden' || getComputedStyle(root).overflow === 'hidden';
    if (bodyLocked) return;
    const dy = e.deltaY * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? window.innerHeight : 1);
    if (Math.abs(e.deltaX) > Math.abs(dy)) return;
    if (canScrollInside(e.target, dy)) return;
    e.preventDefault();
    if (!animating) target = current = lastSet = window.scrollY;
    target = Math.max(0, Math.min(maxScroll(), target + dy));
    if (!animating) {
      animating = true;
      raf = requestAnimationFrame(tick);
    }
  };

  const onScroll = () => {
    if (!animating) target = current = lastSet = window.scrollY;
  };

  // przewijanie programowe (nawigacja, „Odkryj szczegóły”) przerywa bezwładność
  const stop = () => { animating = false; cancelAnimationFrame(raf); target = current = lastSet = window.scrollY; };

  const prevBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('oct:scroll-stop', stop);

  return () => {
    cancelAnimationFrame(raf);
    root.style.scrollBehavior = prevBehavior;
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('oct:scroll-stop', stop);
  };
}

/** Przewiń do pozycji płynnie (zatrzymuje bezwładność kółka). */
export const scrollToY = (top: number, smooth = true) => {
  window.dispatchEvent(new Event('oct:scroll-stop'));
  window.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
};

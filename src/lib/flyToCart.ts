import { prefersReducedMotion } from './motion';

/**
 * Animacja „produkt wlatuje do koszyka”: kopia zdjęcia leci łukiem do ikony koszyka
 * w nagłówku (element z atrybutem data-cart-target), a ikona podskakuje.
 */
export function flyToCart(from: HTMLElement | null | undefined) {
  if (!from || typeof window === 'undefined' || prefersReducedMotion()) return;
  const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-cart-target]'));
  const target = targets.find(t => t.getBoundingClientRect().width > 0);
  // pierwsze faktycznie widoczne zdjęcie (np. aktualny slajd galerii na telefonie)
  const imgs = from.tagName === 'IMG' ? [from as HTMLImageElement] : Array.from(from.querySelectorAll('img'));
  const img = imgs.find(i => {
    const r = i.getBoundingClientRect();
    return r.width > 0 && r.right > 0 && r.left < window.innerWidth;
  });
  if (!target || !img) return;

  const a = img.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  if (a.width === 0 || b.width === 0) return;

  (window as unknown as { __octFlyAt?: number }).__octFlyAt = Date.now();
  const clone = document.createElement('img');
  clone.src = img.currentSrc || img.src;
  clone.alt = '';
  Object.assign(clone.style, {
    position: 'fixed',
    left: `${a.left}px`,
    top: `${a.top}px`,
    width: `${a.width}px`,
    height: `${a.height}px`,
    objectFit: 'contain',
    background: '#fff',
    zIndex: '9999',
    pointerEvents: 'none',
    borderRadius: '10px',
    boxShadow: '0 30px 60px rgba(0,0,0,.5), 0 0 0 2px rgba(215,25,32,.6)',
    transformOrigin: 'center center',
    willChange: 'transform, opacity',
  } as CSSStyleDeclaration);
  document.body.appendChild(clone);

  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const s = Math.min(1, 220 / Math.max(a.width, a.height));

  const anim = clone.animate(
    [
      { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1 },
      { transform: `translate(0,-24px) scale(${s}) rotate(-4deg)`, opacity: 1, offset: 0.2 },
      { transform: `translate(${dx * 0.55}px, ${dy * 0.55 - 140}px) scale(${s * 0.55}) rotate(-12deg)`, opacity: 1, offset: 0.6 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.05) rotate(14deg)`, opacity: 0.4, borderRadius: '50%' },
    ],
    { duration: 950, easing: 'cubic-bezier(.55,0,.3,1)' }
  );
  anim.onfinish = () => {
    clone.remove();
    target.animate(
      [
        { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(215,25,32,0)' },
        { transform: 'scale(1.3)', boxShadow: '0 0 0 10px rgba(215,25,32,.35)' },
        { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(215,25,32,0)' },
      ],
      { duration: 520, easing: 'cubic-bezier(.2,.8,.2,1)' }
    );
  };
}

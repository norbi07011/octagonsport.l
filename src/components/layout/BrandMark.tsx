import React from 'react';

/** Znak firmowy Octagon (białe logo na przezroczystym tle). */
export const BRAND_MARK = '/brand/octagon-mark-white.png';

export const BrandMark: React.FC<{ className?: string; alt?: string }> = ({ className = 'w-9 h-9', alt = 'Octagon' }) => (
  <img src={BRAND_MARK} alt={alt} className={`object-contain select-none ${className}`} draggable={false} />
);

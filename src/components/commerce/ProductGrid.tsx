import React from 'react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  columns?: 3 | 4;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, columns = 4 }) => {
  if (products.length === 0) {
    return (
      <div className="py-16 text-center border border-dashed border-neutral-800 p-8 my-6">
        <p className="font-bebas text-2xl text-neutral-300">Geen artikelen gevonden</p>
        <p className="text-xs text-neutral-500 mt-1">Probeer andere filters of zoektermen te selecteren.</p>
      </div>
    );
  }

  const gridColsClass = columns === 3 
    ? 'grid-cols-2 md:grid-cols-3' 
    : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';

  return (
    <div className={`grid ${gridColsClass} gap-3 sm:gap-5 lg:gap-6`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

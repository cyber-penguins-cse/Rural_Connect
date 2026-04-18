import { Link } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';
import { Product } from '../types';
import StatusBadge from './StatusBadge';

interface Props {
  product: Product;
  showStatus?: boolean;
  actions?: React.ReactNode;
}

export default function ProductCard({ product, showStatus = false, actions }: Props) {
  const avgRating = product.reviews?.length
    ? (product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length).toFixed(1)
    : null;
  const formatText = (text: string): string => {
      return text.trim();
  };
  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group flex flex-col">
      <Link to={`/products/${product.id}`} className="block overflow-hidden aspect-[4/3] bg-stone-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={formatText(product.title)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-4xl opacity-20">🌿</div>
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
            <Link to={`/products/${product.id}`} className="font-semibold text-gray-900 hover:text-green-700 line-clamp-2 text-sm leading-snug flex-1">
                {formatText(product.title)}
            </Link>
            {showStatus && <StatusBadge status={product.status} />}
        </div>

        {product.category && (
            <span className="text-xs text-green-600 font-medium mb-2">{product.category.name}</span>
     )}

    <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
        {formatText(product.description)}
    </p>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">₹{Number(product.price).toLocaleString('en-IN')}</span>
          <div className="flex flex-col items-end gap-1">
            {avgRating && (
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-xs text-gray-600 font-medium">{avgRating}</span>
              </div>
            )}
            {product.seller && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-stone-400" />
                <span className="text-xs text-stone-400">{product.seller.full_name}</span>
              </div>
            )}
          </div>
        </div>

        {actions && <div className="mt-3 pt-3 border-t border-stone-100">{actions}</div>}
      </div>
    </div>
  );
}
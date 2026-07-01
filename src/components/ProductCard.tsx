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

  return (
    <div className="card-lift bg-white rounded-2xl border border-stone-200 overflow-hidden group flex flex-col">
      <Link to={`/products/${product.id}`} className="block overflow-hidden aspect-[4/3] bg-stone-100 relative">
        {product.image_url ? (
          <>
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-full object-cover product-image-hover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-green-500 via-transparent to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-4xl opacity-20">🌿</div>
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <Link to={`/products/${product.id}`} className="font-semibold text-gray-900 hover:text-green-600 line-clamp-2 text-sm leading-snug flex-1 smooth-transition">
            {product.title}
          </Link>
          {showStatus && <StatusBadge status={product.status} />}
        </div>

        {product.category && (
          <span className="text-xs text-green-600 font-medium mb-2 group-hover:text-emerald-600 smooth-transition">{product.category.name}</span>
        )}

        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed group-hover:text-gray-600 smooth-transition">{product.description}</p>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900 group-hover:text-green-600 smooth-transition">₹{Number(product.price).toLocaleString('en-IN')}</span>
          <div className="flex flex-col items-end gap-1">
            {avgRating && (
              <div className="flex items-center gap-1 group-hover:scale-110 smooth-transition origin-right">
                <Star className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
                <span className="text-xs text-gray-600 font-medium">{avgRating}</span>
              </div>
            )}
            {product.seller && (
              <div className="flex items-center gap-1 group-hover:text-green-600 smooth-transition">
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

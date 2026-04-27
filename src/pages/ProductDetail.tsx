import { useEffect, useState, FormEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, MessageSquare, AlertCircle, CheckCircle, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import { enquiriesService } from '../services/enquiries';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [enquiryLoading, setEnquiryLoading] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [enquiryError, setEnquiryError] = useState('');

  useEffect(() => {
    if (!id) return;
    supabase
      .from('products')
      .select('*, seller:profiles(id,full_name,email), category:categories(id,name), reviews(id,rating,comment,created_at,buyer:profiles(full_name))')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        setProduct(data);
        setLoading(false);
      });
  }, [id]);

  const avgRating = product?.reviews?.length
    ? (product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length)
    : null;

  const handleEnquiry = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !product) { navigate('/login'); return; }
    setEnquiryLoading(true);
    setEnquiryError('');
    const { error } = await enquiriesService.create(user.id, product.seller_id, product.id, message);
    if (error) {
      setEnquiryError(error.message || 'Failed to send enquiry.');
    } else {
      setEnquirySuccess(true);
      setMessage('');
    }
    setEnquiryLoading(false);
  };

  if (loading) return <LoadingSpinner />;
  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
      <p className="text-gray-500">Product not found.</p>
      <Link to="/products" className="text-purple-600 text-sm hover:underline mt-2 inline-block">Back to marketplace</Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/products" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-8 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image */}
        <div className="aspect-square bg-stone-100 rounded-2xl overflow-hidden">
          {product.image_url ? (
            <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">🌿</div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            {product.category && (
              <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full">
                {product.category.name}
              </span>
            )}
            <StatusBadge status={product.status} />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>

          {avgRating !== null && (
            <div className="flex items-center gap-1.5 mb-4">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.round(avgRating) ? 'text-amber-400 fill-amber-400' : 'text-stone-300'}`} />
              ))}
              <span className="text-sm text-gray-600 ml-1">{avgRating.toFixed(1)} ({product.reviews?.length} reviews)</span>
            </div>
          )}

          <div className="text-3xl font-bold text-gray-900 mb-6">₹{Number(product.price).toLocaleString('en-IN')}</div>

          <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

          {product.seller && (
            <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl mb-8 border border-stone-200">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center font-semibold text-purple-700">
                {product.seller.full_name.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">{product.seller.full_name}</div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" /> Rural Maker
                </div>
              </div>
            </div>
          )}

          {/* Enquiry Form */}
          {profile?.role === 'BUYER' && product.status === 'APPROVED' && (
            <div className="bg-white border border-stone-200 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-600" />
                Send Enquiry
              </h3>

              {enquirySuccess ? (
                <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-3 rounded-xl text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Enquiry sent! The seller will respond soon.
                </div>
              ) : (
                <form onSubmit={handleEnquiry} className="space-y-3">
                  {enquiryError && (
                    <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm">
                      <AlertCircle className="w-4 h-4" /> {enquiryError}
                    </div>
                  )}
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={4}
                    placeholder="Describe what you're looking for, quantity needed, customization requests..."
                    className="w-full px-4 py-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                  <button
                    type="submit"
                    disabled={enquiryLoading}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60"
                  >
                    {enquiryLoading ? 'Sending...' : 'Send Enquiry'}
                  </button>
                </form>
              )}
            </div>
          )}

          {!user && product.status === 'APPROVED' && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
              <p className="text-amber-800 text-sm font-medium mb-3">Sign in as a buyer to enquire about this product</p>
              <Link to="/login" className="inline-block px-5 py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 transition-colors">
                Sign in
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      {product.reviews && product.reviews.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.reviews.map((review) => (
              <div key={review.id} className="bg-white border border-stone-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-gray-900 text-sm">{(review as unknown as { buyer: { full_name: string } }).buyer?.full_name ?? 'Buyer'}</div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-stone-300'}`} />
                    ))}
                  </div>
                </div>
                {review.comment && <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


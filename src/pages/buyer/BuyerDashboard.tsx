import { useEffect, useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, MessageSquare, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { enquiriesService } from '../../services/enquiries';
import { reviewsService } from '../../services/reviews';
import { Enquiry } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

interface EnquiryWithReview extends Enquiry {
  hasReview?: boolean;
}

export default function BuyerDashboard() {
  const { profile } = useAuth();
  const [enquiries, setEnquiries] = useState<EnquiryWithReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState<{ enquiry: EnquiryWithReview } | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);

  const load = async () => {
    if (!profile) return;
    const { data } = await enquiriesService.getBuyerEnquiries(profile.id);
    const enquiryList = data ?? [];

    const withReviews = await Promise.all(
      enquiryList.map(async (e) => {
        if (e.status !== 'COMPLETED') return { ...e, hasReview: false };
        const { data: review } = await reviewsService.getByEnquiry(e.id);
        return { ...e, hasReview: !!review };
      })
    );
    setEnquiries(withReviews);
    setLoading(false);
  };

  useEffect(() => { load(); }, [profile]);

  const handleReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!reviewModal || !profile) return;
    const { enquiry } = reviewModal;
    setReviewLoading(true);

    const product = (enquiry as unknown as { product: { id: string } }).product;
    await reviewsService.create(
      profile.id,
      enquiry.seller_id,
      product.id,
      enquiry.id,
      reviewForm.rating,
      reviewForm.comment
    );
    setReviewModal(null);
    setReviewForm({ rating: 5, comment: '' });
    setReviewLoading(false);
    load();
  };

  const stats = {
    total: enquiries.length,
    pending: enquiries.filter((e) => e.status === 'PENDING').length,
    accepted: enquiries.filter((e) => e.status === 'ACCEPTED').length,
    completed: enquiries.filter((e) => e.status === 'COMPLETED').length,
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Buyer Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back, {profile?.full_name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Enquiries', value: stats.total, icon: MessageSquare, color: 'text-blue-600 bg-blue-50' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-600 bg-amber-50' },
          { label: 'Accepted', value: stats.accepted, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
          { label: 'Completed', value: stats.completed, icon: Star, color: 'text-emerald-600 bg-emerald-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-stone-200 rounded-xl p-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">My Enquiries</h2>
        <Link to="/products" className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
          <ShoppingBag className="w-4 h-4" /> Browse products
        </Link>
      </div>

      <div className="space-y-3">
        {enquiries.length === 0 ? (
          <div className="text-center py-16 bg-white border border-stone-200 rounded-2xl">
            <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No enquiries yet</p>
            <Link to="/products" className="text-green-600 text-sm hover:underline mt-1 inline-block">Browse the marketplace</Link>
          </div>
        ) : enquiries.map((e) => {
          const product = (e as unknown as { product: { id: string; title: string; image_url?: string; price: number } }).product;
          const seller = (e as unknown as { seller: { full_name: string } }).seller;
          return (
            <div key={e.id} className="bg-white border border-stone-200 rounded-xl p-5">
              <div className="flex items-start gap-4">
                <Link to={`/products/${product?.id}`} className="w-16 h-16 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity">
                  {product?.image_url ? <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">🌿</div>}
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Link to={`/products/${product?.id}`} className="font-semibold text-gray-900 text-sm hover:text-green-700">{product?.title}</Link>
                    <StatusBadge status={e.status} />
                  </div>
                  <div className="text-xs text-gray-500 mb-2">Seller: {seller?.full_name}</div>
                  <p className="text-sm text-gray-600 bg-stone-50 rounded-lg px-3 py-2 text-ellipsis overflow-hidden">{e.message}</p>

                  {e.status === 'COMPLETED' && !e.hasReview && (
                    <button
                      onClick={() => setReviewModal({ enquiry: e })}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors border border-amber-200"
                    >
                      <Star className="w-3.5 h-3.5" /> Leave a Review
                    </button>
                  )}
                  {e.status === 'COMPLETED' && e.hasReview && (
                    <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                      <CheckCircle className="w-3.5 h-3.5" /> Review submitted
                    </div>
                  )}
                </div>
                <div className="text-xs text-stone-400 flex-shrink-0">{new Date(e.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-gray-900 text-lg mb-1">Leave a Review</h3>
            <p className="text-sm text-gray-500 mb-5">
              {(reviewModal.enquiry as unknown as { product: { title: string } }).product?.title}
            </p>

            <form onSubmit={handleReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setReviewForm((f) => ({ ...f, rating: n }))}
                      className="transition-transform hover:scale-110"
                    >
                      <Star className={`w-8 h-8 ${n <= reviewForm.rating ? 'text-amber-400 fill-amber-400' : 'text-stone-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Comment (optional)</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  placeholder="Share your experience..."
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setReviewModal(null)} className="flex-1 py-2.5 border border-stone-300 text-gray-700 font-medium rounded-xl text-sm hover:bg-stone-50">
                  Cancel
                </button>
                <button type="submit" disabled={reviewLoading} className="flex-1 py-2.5 bg-green-600 text-white font-semibold rounded-xl text-sm hover:bg-green-700 disabled:opacity-60">
                  {reviewLoading ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

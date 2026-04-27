import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package, MessageSquare, CreditCard as Edit, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { productsService } from '../../services/products';
import { enquiriesService } from '../../services/enquiries';
import { Product, Enquiry } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function SellerDashboard() {
  const { profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'products' | 'enquiries'>('products');

  const load = async () => {
    if (!profile) return;
    const [pRes, eRes] = await Promise.all([
      productsService.getSellerProducts(profile.id),
      enquiriesService.getSellerEnquiries(profile.id),
    ]);
    setProducts(pRes.data ?? []);
    setEnquiries(eRes.data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [profile]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await productsService.delete(id);
    setProducts(products.filter((p) => p.id !== id));
  };

  const handleEnquiryStatus = async (id: string, status: 'ACCEPTED' | 'REJECTED') => {
    await enquiriesService.updateStatus(id, status);
    setEnquiries(enquiries.map((e) => e.id === id ? { ...e, status } : e));
  };

  const markCompleted = async (id: string) => {
    await enquiriesService.updateStatus(id, 'COMPLETED');
    setEnquiries(enquiries.map((e) => e.id === id ? { ...e, status: 'COMPLETED' } : e));
  };

  const stats = {
    total: products.length,
    approved: products.filter((p) => p.status === 'APPROVED').length,
    pending: products.filter((p) => p.status === 'PENDING').length,
    enquiriesPending: enquiries.filter((e) => e.status === 'PENDING').length,
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, {profile?.full_name}</p>
        </div>
        <Link to="/seller/products/new" className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 transition-colors">
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Products', value: stats.total, icon: Package, color: 'text-blue-600 bg-blue-50' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'text-purple-600 bg-purple-50' },
          { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'text-amber-600 bg-amber-50' },
          { label: 'New Enquiries', value: stats.enquiriesPending, icon: MessageSquare, color: 'text-orange-600 bg-orange-50' },
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

      {/* Tabs */}
      <div className="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit mb-6">
        {(['products', 'enquiries'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t} {t === 'enquiries' && stats.enquiriesPending > 0 && (
              <span className="ml-1 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">{stats.enquiriesPending}</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'products' && (
        <div className="space-y-3">
          {products.length === 0 ? (
            <div className="text-center py-16 bg-white border border-stone-200 rounded-2xl">
              <Package className="w-10 h-10 text-stone-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No products yet</p>
              <Link to="/seller/products/new" className="text-purple-600 text-sm hover:underline mt-1 inline-block">Add your first product</Link>
            </div>
          ) : products.map((p) => (
            <div key={p.id} className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-4">
              <div className="w-16 h-16 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                {p.image_url ? <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">🌿</div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900 text-sm truncate">{p.title}</span>
                  <StatusBadge status={p.status} />
                </div>
                <div className="text-sm text-purple-700 font-semibold mt-0.5">₹{Number(p.price).toLocaleString('en-IN')}</div>
                {p.category && <div className="text-xs text-stone-400 mt-0.5">{p.category.name}</div>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link to={`/seller/products/${p.id}/edit`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                </Link>
                <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'enquiries' && (
        <div className="space-y-3">
          {enquiries.length === 0 ? (
            <div className="text-center py-16 bg-white border border-stone-200 rounded-2xl">
              <MessageSquare className="w-10 h-10 text-stone-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No enquiries yet</p>
            </div>
          ) : enquiries.map((e) => (
            <div key={e.id} className="bg-white border border-stone-200 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 text-sm">{(e as unknown as { buyer: { full_name: string } }).buyer?.full_name ?? 'Buyer'}</span>
                    <StatusBadge status={e.status} />
                  </div>
                  <div className="text-xs text-purple-600 font-medium mb-2">{(e as unknown as { product: { title: string } }).product?.title}</div>
                  <p className="text-sm text-gray-600 bg-stone-50 rounded-lg px-3 py-2 leading-relaxed">{e.message}</p>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {e.status === 'PENDING' && (
                    <>
                      <button onClick={() => handleEnquiryStatus(e.id, 'ACCEPTED')} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-colors">
                        <CheckCircle className="w-3.5 h-3.5" /> Accept
                      </button>
                      <button onClick={() => handleEnquiryStatus(e.id, 'REJECTED')} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors border border-red-200">
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </>
                  )}
                  {e.status === 'ACCEPTED' && (
                    <button onClick={() => markCompleted(e.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors">
                      <CheckCircle className="w-3.5 h-3.5" /> Mark Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


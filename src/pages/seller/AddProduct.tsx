import { useEffect, useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { productsService } from '../../services/products';
import { supabase } from '../../lib/supabase';
import { Category } from '../../types';

export default function AddProduct() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ title: '', description: '', price: '', category_id: '', image_url: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.from('categories').select('*').then(({ data }) => setCategories(data ?? []));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    setError('');
    const { error: err } = await productsService.create(profile.id, {
      title: form.title,
      description: form.description,
      price: parseFloat(form.price),
      category_id: form.category_id,
      image_url: form.image_url,
    });
    if (err) { setError(err.message || 'Failed to create product.'); setLoading(false); }
    else navigate('/seller/dashboard');
  };

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/seller/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-8 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to dashboard
      </Link>

      <div className="bg-white border border-stone-200 rounded-2xl p-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">List a New Product</h1>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl mb-5 border border-red-100">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Title *</label>
            <input type="text" value={form.title} onChange={(e) => set('title', e.target.value)} required className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g., Handwoven Bamboo Basket" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)} required rows={4} className="w-full px-4 py-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" placeholder="Describe your product, materials used, dimensions, unique features..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (₹) *</label>
              <input type="number" value={form.price} onChange={(e) => set('price', e.target.value)} required min="1" step="0.01" className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <select value={form.category_id} onChange={(e) => set('category_id', e.target.value)} className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Image URL</label>
            <input type="url" value={form.image_url} onChange={(e) => set('image_url', e.target.value)} className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="https://images.pexels.com/..." />
            {form.image_url && (
              <div className="mt-2 w-24 h-24 rounded-lg overflow-hidden border border-stone-200">
                <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
              </div>
            )}
          </div>

          <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded-lg border border-amber-100">
            Your product will be reviewed by our admin team before going live on the marketplace.
          </div>

          <div className="flex gap-3 pt-2">
            <Link to="/seller/dashboard" className="flex-1 py-3 border border-stone-300 text-gray-700 font-semibold rounded-xl text-sm text-center hover:bg-stone-50 transition-colors">Cancel</Link>
            <button type="submit" disabled={loading} className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-60">
              {loading ? 'Submitting...' : 'Submit for Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

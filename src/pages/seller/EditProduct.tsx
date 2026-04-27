import { useEffect, useState, FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { productsService } from '../../services/products';
import { supabase } from '../../lib/supabase';
import { Product, Category } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ title: '', description: '', price: '', category_id: '', image_url: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    Promise.all([
      productsService.getById(id),
      supabase.from('categories').select('*'),
    ]).then(([pRes, cRes]) => {
      const p = pRes.data;
      if (p) {
        setProduct(p);
        setForm({
          title: p.title,
          description: p.description,
          price: String(p.price),
          category_id: p.category_id ?? '',
          image_url: p.image_url ?? '',
        });
      }
      setCategories(cRes.data ?? []);
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    setError('');
    const { error: err } = await productsService.update(id, {
      title: form.title,
      description: form.description,
      price: parseFloat(form.price),
      category_id: form.category_id,
      image_url: form.image_url,
    });
    if (err) { setError(err.message); setSaving(false); }
    else navigate('/seller/dashboard');
  };

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  if (loading) return <LoadingSpinner />;
  if (!product) return <div className="text-center py-20 text-gray-500">Product not found</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/seller/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-8 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to dashboard
      </Link>

      <div className="bg-white border border-stone-200 rounded-2xl p-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Edit Product</h1>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl mb-5 border border-red-100">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Title *</label>
            <input type="text" value={form.title} onChange={(e) => set('title', e.target.value)} required className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)} required rows={4} className="w-full px-4 py-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (₹) *</label>
              <input type="number" value={form.price} onChange={(e) => set('price', e.target.value)} required min="1" step="0.01" className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <select value={form.category_id} onChange={(e) => set('category_id', e.target.value)} className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Image URL</label>
            <input type="url" value={form.image_url} onChange={(e) => set('image_url', e.target.value)} className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            {form.image_url && (
              <div className="mt-2 w-24 h-24 rounded-lg overflow-hidden border border-stone-200">
                <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Link to="/seller/dashboard" className="flex-1 py-3 border border-stone-300 text-gray-700 font-semibold rounded-xl text-sm text-center hover:bg-stone-50 transition-colors">Cancel</Link>
            <button type="submit" disabled={saving} className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const PAGE_SIZE = 12;

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const page = parseInt(searchParams.get('page') ?? '1');
  const categoryId = searchParams.get('category') ?? '';
  const search = searchParams.get('search') ?? '';

  useEffect(() => {
    supabase.from('categories').select('*').then(({ data }) => setCategories(data ?? []));
  }, []);

  useEffect(() => {
    setLoading(true);
    let query = supabase
      .from('products')
      .select('*, seller:profiles(id,full_name,email), category:categories(id,name), reviews(id,rating)', { count: 'exact' })
      .eq('status', 'APPROVED')
      .order('created_at', { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    if (categoryId) query = query.eq('category_id', categoryId);
    if (search) query = query.ilike('title', `%${search}%`);

    query.then(({ data, count }) => {
      setProducts(data ?? []);
      setTotal(count ?? 0);
      setLoading(false);
    });
  }, [page, categoryId, search]);

  const setParam = (key: string, val: string) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
        <p className="text-gray-500 text-sm mt-1">{total} products from rural makers across Sri Lanka</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products..."
            defaultValue={search}
            onChange={(e) => setParam('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          />
        </div>
        <div className="relative">
          <SlidersHorizontal className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <select
            value={categoryId}
            onChange={(e) => setParam('category', e.target.value)}
            className="pl-10 pr-8 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white appearance-none cursor-pointer min-w-48"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 flex-wrap mb-8">
        <button
          onClick={() => setParam('category', '')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!categoryId ? 'bg-green-600 text-white' : 'bg-white border border-stone-200 text-gray-600 hover:border-green-300'}`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setParam('category', c.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${categoryId === c.id ? 'bg-green-600 text-white' : 'bg-white border border-stone-200 text-gray-600 hover:border-green-300'}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : products.length === 0 ? (
        <div className="text-center py-24">
          <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No products found</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                disabled={page <= 1}
                onClick={() => { const p = new URLSearchParams(searchParams); p.set('page', String(page - 1)); setSearchParams(p); }}
                className="p-2 rounded-lg border border-stone-200 text-gray-600 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => { const p = new URLSearchParams(searchParams); p.set('page', String(n)); setSearchParams(p); }}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${n === page ? 'bg-green-600 text-white' : 'border border-stone-200 text-gray-600 hover:bg-stone-100'}`}
                >
                  {n}
                </button>
              ))}
              <button
                disabled={page >= totalPages}
                onClick={() => { const p = new URLSearchParams(searchParams); p.set('page', String(page + 1)); setSearchParams(p); }}
                className="p-2 rounded-lg border border-stone-200 text-gray-600 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

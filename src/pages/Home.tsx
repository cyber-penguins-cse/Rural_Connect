import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, Star, Users, Package, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState({ products: 0, sellers: 0, buyers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async (): Promise<void> => {
      try{
      const [productsRes, categoriesRes, sellersRes, buyersRes, prodCountRes] = await Promise.all([
        supabase.from('products').select('*, seller:profiles(id,full_name,email), category:categories(id,name), reviews(id,rating)').eq('status', 'APPROVED').order('created_at', { ascending: false }).limit(6),
        supabase.from('categories').select('*').limit(6),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'SELLER'),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'BUYER'),
        supabase.from('products').select('id', { count: 'exact' }).eq('status', 'APPROVED'),
      ]);
      setFeaturedProducts(productsRes.data ?? []);
      setCategories(categoriesRes.data ?? []);
      setStats({
        sellers: sellersRes.count ?? 0,
        buyers: buyersRes.count ?? 0,
        products: prodCountRes.count ?? 0,
      });
      setLoading(false);
    }catch(error){
      console.error('Error loading home data:',error);
       setLoading (false);
    }
    };
    load();
  }, []);

  const categoryIcons: Record<string, string> = {
    Handicrafts: '🪡',
    Agriculture: '🌾',
    Textiles: '🧵',
    'Food & Spices': '🌶️',
    Pottery: '🏺',
    Jewelry: '💍',
  };

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#e6f7e6] via-[#ccedcc] to-[#b3e2b3] text-[#064d06] overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 40%, rgba(0,128,0,0.16) 0%, transparent 55%), radial-gradient(circle at 85% 25%, rgba(0,128,0,0.2) 0%, transparent 45%)' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/90 px-4 py-2 rounded-full text-sm font-medium text-[#006600] mb-6 border border-[#c0e0c0] shadow-sm">
              <span className="w-2 h-2 bg-[#008000] rounded-full animate-pulse" />
              Sri Lanka's Rural Marketplace
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Discover Authentic<br />
              <span className="text-[#008000]">Rural Craftsmanship</span>
            </h1>
            <p className="text-lg text-[#064d06] mb-10 max-w-xl leading-relaxed">
              Connect directly with rural artisans and makers. Buy unique handcrafted products, support local communities, and celebrate Sri Lanka's rich heritage.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-[#008000] hover:bg-[#006600] text-white font-semibold px-6 py-3.5 rounded-xl transition-colors shadow-lg shadow-[#008000]/20"
              >
                Browse Marketplace <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white text-[#006600] hover:bg-[#f0fff0] border border-[#008000] font-semibold px-6 py-3.5 rounded-xl transition-colors"
              >
                Start Selling
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-3 gap-6">
            {[
              { icon: Package, label: 'Products Listed', value: stats.products, color: 'text-[#006600] bg-[#e6ffe6]' },
              { icon: Users, label: 'Active Sellers', value: stats.sellers, color: 'text-[#006600] bg-[#e6ffe6]' },
              { icon: TrendingUp, label: 'Happy Buyers', value: stats.buyers, color: 'text-[#006600] bg-[#e6ffe6]' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-xl hover:bg-stone-50 transition-colors">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-2xl font-bold text-gray-900">{value.toLocaleString()}+</div>
                  <div className="text-sm text-gray-500">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
            <p className="text-gray-500 text-sm mt-2">Explore our curated rural product categories</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.id}`}
              className="flex flex-col items-center gap-4 p-6 bg-white rounded-2xl border border-stone-200 hover:border-[#008000] hover:shadow-lg hover:bg-[#f0fff0] transition-all duration-300 group"
            >
              <span className="text-4xl group-hover:scale-125 transition-transform duration-300">{categoryIcons[cat.name] ?? '🌿'}</span>
              <span className="text-sm font-semibold text-gray-700 text-center leading-tight">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
            <p className="text-gray-500 text-sm mt-2">Handpicked from our finest rural makers</p>
          </div>
          <Link to="/products" className="text-sm font-medium text-[#008000] hover:text-[#006600] flex items-center gap-1 transition-colors duration-200">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No products yet. Be the first to list!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-7">
            {featuredProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="bg-[#f0fff0] text-[#053805] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl font-bold mb-3">How RuralConnect Works</h2>
            <p className="text-[#006600] text-sm">Simple, transparent, and community-first</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: ShieldCheck, step: '01', title: 'Verified Sellers', desc: 'All sellers are verified by our admin team. Products are reviewed before going live.' },
              { icon: Truck, step: '02', title: 'Direct Enquiry', desc: 'Buyers send enquiries directly to sellers. Negotiate and close deals seamlessly.' },
              { icon: Star, step: '03', title: 'Review & Rate', desc: 'After every completed deal, buyers can leave honest reviews to build trust.' },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="relative p-6 bg-white rounded-2xl border border-[#c7e7c7] shadow-sm">
                <div className="text-5xl font-black text-[#c7e7c7] absolute top-4 right-4">{step}</div>
                <div className="w-12 h-12 bg-[#008000] rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-[#006600] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-5">Ready to join RuralConnect?</h2>
        <p className="text-gray-500 mb-10 max-w-md mx-auto">Join thousands of rural makers and buyers creating a better rural economy.</p>
        <div className="flex justify-center gap-5">
          <Link to="/register" className="px-8 py-4 bg-[#008000] text-white font-semibold rounded-xl hover:bg-[#006600] transition-all duration-300 shadow-lg shadow-[#008000]/30 hover:shadow-xl hover:shadow-[#008000]/40 hover:-translate-y-0.5">
            Create Free Account
          </Link>
          <Link to="/products" className="px-8 py-4 border border-[#008000] text-[#006600] font-semibold rounded-xl hover:bg-[#f0fff0] hover:border-[#008000] transition-all duration-300">
            Explore Products
          </Link>
        </div>
      </section>
    </div>
  );
}


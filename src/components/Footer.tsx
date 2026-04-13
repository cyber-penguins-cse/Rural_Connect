import { Link } from 'react-router-dom';
import { Sprout, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-stone-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 bg-green-600 rounded-xl flex items-center justify-center">
                <Sprout className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900">Rural<span className="text-green-600">Connect</span></span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Empowering rural artisans and makers by connecting them directly with buyers across the country.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Marketplace</h4>
            <ul className="space-y-2">
              {[['Browse Products', '/products'], ['Sell Your Crafts', '/register'], ['How It Works', '/']].map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="text-sm text-gray-500 hover:text-green-600 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Account</h4>
            <ul className="space-y-2">
              {[['Sign In', '/login'], ['Create Account', '/register']].map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="text-sm text-gray-500 hover:text-green-600 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-stone-200 mt-8 pt-6 flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} RuralConnect. All rights reserved.</p>
          <p className="text-xs text-gray-400 flex items-center gap-1">Made with <Heart className="w-3 h-3 text-red-400 fill-red-400" /> for rural communities</p>
        </div>
      </div>
    </footer>
  );
}

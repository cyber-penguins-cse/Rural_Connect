import { useEffect, useState } from 'react';
import { Sprout } from 'lucide-react';

interface SplashScreenProps {
  isLoading: boolean;
  onLoadingComplete: () => void;
}

export default function SplashScreen({ isLoading, onLoadingComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onLoadingComplete();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isLoading, onLoadingComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ top: '20%', left: '10%' }} />
        <div className="absolute w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" style={{ top: '40%', right: '10%' }} />
        <div className="absolute w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" style={{ bottom: '10%', left: '50%' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo container with pulse effect */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl blur-2xl opacity-75 animate-pulse" />
          <div className="relative bg-gradient-to-br from-emerald-500 to-green-500 p-6 rounded-2xl">
            <Sprout className="w-16 h-16 text-white animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>

        {/* Text with staggered animation */}
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Rural<span className="text-emerald-400">Connect</span>
          </h1>
          <p className="text-green-300 text-sm font-medium animate-fade-in" style={{ animationDelay: '0.3s' }}>
            Connecting Rural Artisans
          </p>
        </div>

        {/* Loading bar with gradient */}
        <div className="w-64 h-1.5 bg-white/20 rounded-full overflow-hidden mt-4">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-400 rounded-full animate-loading-bar"
            style={{
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.8)',
            }}
          />
        </div>

        {/* Dot animation */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SplashScreen from './components/SplashScreen';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import SellerDashboard from './pages/seller/SellerDashboard';
import AddProduct from './pages/seller/AddProduct';
import EditProduct from './pages/seller/EditProduct';
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <AuthProvider>
      {showSplash && <SplashScreen isLoading={isLoading} onLoadingComplete={handleSplashComplete} />}
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-stone-50">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />

              <Route element={<ProtectedRoute allowedRoles={['SELLER']} />}>
                <Route path="/seller/dashboard" element={<SellerDashboard />} />
                <Route path="/seller/products/new" element={<AddProduct />} />
                <Route path="/seller/products/:id/edit" element={<EditProduct />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['BUYER']} />}>
                <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

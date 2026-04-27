import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Users, Package, ShieldOff, Shield, AlertTriangle, Clock } from 'lucide-react';
import { adminService } from '../../services/admin';
import { productsService } from '../../services/products';
import { Product, Profile } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'pending' | 'all' | 'users'>('pending');

  const load = async () => {
    const [pRes, uRes] = await Promise.all([
      productsService.getAllForAdmin(),
      adminService.getAllUsers(),
    ]);
    setProducts(pRes.data ?? []);
    setUsers(uRes.data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleProductStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    await productsService.updateStatus(id, status);
    setProducts(products.map((p) => p.id === id ? { ...p, status } : p));
  };

  const handleSuspend = async (userId: string, suspend: boolean) => {
    await adminService.suspendUser(userId, suspend);
    setUsers(users.map((u) => u.id === userId ? { ...u, is_suspended: suspend } : u));
  };

  const pendingProducts = products.filter((p) => p.status === 'PENDING');
  const stats = {
    pending: pendingProducts.length,
    approved: products.filter((p) => p.status === 'APPROVED').length,
    users: users.length,
    suspended: users.filter((u) => u.is_suspended).length,
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Manage the RuralConnect marketplace</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'text-amber-600 bg-amber-50', badge: stats.pending > 0 },
          { label: 'Approved Listings', value: stats.approved, icon: Package, color: 'text-purple-600 bg-purple-50', badge: false },
          { label: 'Total Users', value: stats.users, icon: Users, color: 'text-blue-600 bg-blue-50', badge: false },
          { label: 'Suspended', value: stats.suspended, icon: AlertTriangle, color: 'text-red-600 bg-red-50', badge: false },
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
        {([
          { key: 'pending', label: 'Pending Approval', badge: stats.pending },
          { key: 'all', label: 'All Products' },
          { key: 'users', label: 'Users' },
        ] as const).map(({ key, label, badge }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {label}
            {badge !== undefined && badge > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">{badge}</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'pending' && (
        <div className="space-y-3">
          {pendingProducts.length === 0 ? (
            <div className="text-center py-16 bg-white border border-stone-200 rounded-2xl">
              <CheckCircle className="w-10 h-10 text-purple-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">All caught up! No pending products.</p>
            </div>
          ) : pendingProducts.map((p) => (
            <div key={p.id} className="bg-white border border-amber-200 rounded-xl p-5 flex items-start gap-4">
              <Link to={`/products/${p.id}`} className="w-16 h-16 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity">
                {p.image_url ? <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">🌿</div>}
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Link to={`/products/${p.id}`} className="font-semibold text-gray-900 text-sm hover:text-purple-700">{p.title}</Link>
                  <StatusBadge status={p.status} />
                </div>
                <div className="text-xs text-gray-500 mb-1">By {(p as unknown as { seller: { full_name: string } }).seller?.full_name}</div>
                <div className="text-sm font-semibold text-purple-700">₹{Number(p.price).toLocaleString('en-IN')}</div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.description}</p>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button onClick={() => handleProductStatus(p.id, 'APPROVED')} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-colors">
                  <CheckCircle className="w-3.5 h-3.5" /> Approve
                </button>
                <button onClick={() => handleProductStatus(p.id, 'REJECTED')} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors border border-red-200">
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'all' && (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Seller</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/products/${p.id}`} className="font-medium text-gray-900 hover:text-purple-700 line-clamp-1">{p.title}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{(p as unknown as { seller: { full_name: string } }).seller?.full_name}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">₹{Number(p.price).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {p.status !== 'APPROVED' && (
                        <button onClick={() => handleProductStatus(p.id, 'APPROVED')} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-lg hover:bg-purple-100 transition-colors">Approve</button>
                      )}
                      {p.status !== 'REJECTED' && (
                        <button onClick={() => handleProductStatus(p.id, 'REJECTED')} className="px-2 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors">Reject</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'users' && (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {users.map((u) => (
                <tr key={u.id} className={`hover:bg-stone-50 transition-colors ${u.is_suspended ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3 font-medium text-gray-900">{u.full_name}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      u.role === 'ADMIN' ? 'bg-blue-50 text-blue-700' : u.role === 'SELLER' ? 'bg-purple-50 text-purple-700' : 'bg-stone-100 text-stone-600'
                    }`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${u.is_suspended ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      {u.is_suspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.role !== 'ADMIN' && (
                      <button
                        onClick={() => handleSuspend(u.id, !u.is_suspended)}
                        className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                          u.is_suspended
                            ? 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                      >
                        {u.is_suspended ? <><Shield className="w-3 h-3" /> Reinstate</> : <><ShieldOff className="w-3 h-3" /> Suspend</>}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


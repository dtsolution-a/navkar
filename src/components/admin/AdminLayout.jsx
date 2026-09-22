import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tag, ShoppingBag, FileText,
  MessageSquare, LogOut, Menu, X, Shield, ChevronDown, Star, Briefcase,
  Sliders, Layers, Image, UserCheck, Calendar, Settings, UserCog, Database, Gauge, BookOpen
} from 'lucide-react';
import api from '../../pages/admin/AdminAPI';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate('/ad-admin/login');
      return;
    }
    api.getMe()
      .then(u => setUser(u))
      .catch(() => navigate('/ad-admin/login'))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    api.clearToken();
    navigate('/ad-admin/login');
  };

  const navItems = [
    { to: '/ad-admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/ad-admin/hero-slides', icon: Sliders, label: 'Hero Slides' },
    { to: '/ad-admin/brands', icon: Package, label: 'Brands' },
    { to: '/ad-admin/categories', icon: Tag, label: 'Categories' },
    { to: '/ad-admin/products', icon: ShoppingBag, label: 'Products' },
    { to: '/ad-admin/solutions', icon: Layers, label: 'Solutions' },
    { to: '/ad-admin/gallery', icon: Image, label: 'Gallery' },
    { to: '/ad-admin/blog', icon: FileText, label: 'Blog Posts' },
    { to: '/ad-admin/contacts', icon: MessageSquare, label: 'Enquiries' },
    { to: '/ad-admin/testimonials', icon: Star, label: 'Testimonials' },
    { to: '/ad-admin/jobs', icon: Briefcase, label: 'Jobs' },
    { to: '/ad-admin/applications', icon: UserCheck, label: 'Applications' },
    { to: '/ad-admin/timeline', icon: Calendar, label: 'Timeline' },
    { to: '/ad-admin/selection-catalog', icon: Database, label: 'Selection: Catalog' },
    { to: '/ad-admin/selection-salesmen', icon: UserCog, label: 'Selection: Salesmen' },
    { to: '/ad-admin/selection-pricing', icon: Tag, label: 'Selection: Pricing' },
    { to: '/ad-admin/selection-settings', icon: Gauge, label: 'Selection: Settings' },
    { to: '/ad-admin/selection-reference', icon: BookOpen, label: 'Selection: Reference' },
    { to: '/ad-admin/settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (path, end) => {
    if (end) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-gray-900 text-white flex flex-col
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="p-5 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-accent" />
              <div>
                <h2 className="font-bold text-lg text-white">Navkar Admin</h2>
                <p className="text-xs text-gray-400">Control Panel</p>
              </div>
            </div>
            <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="p-4 space-y-1 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-gray-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-700">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive(item.to, item.end)
                  ? 'bg-accent/20 text-accent'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3 px-4">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-sm font-bold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.username}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg w-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between lg:justify-end sticky top-0 z-30">
          <button className="lg:hidden text-gray-600" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:block">
              Welcome, <span className="font-medium text-gray-700">{user?.username}</span>
            </span>
            <a href="/" target="_blank" className="text-sm text-accent hover:underline hidden sm:block">
              View Website →
            </a>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
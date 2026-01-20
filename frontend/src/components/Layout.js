import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Store,
  LayoutGrid,
  Package,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  Users,
  FileBarChart,
  Boxes,
} from 'lucide-react';

const Layout = ({ children }) => {
  const { tenant, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Nav items - some only visible to owners
  const navItems = [
    { to: '/pos', icon: LayoutGrid, label: 'Kasir', roles: ['pemilik', 'kasir'] },
    { to: '/items', icon: Package, label: 'Barang', roles: ['pemilik', 'kasir'] },
    { to: '/history', icon: Receipt, label: 'Riwayat', roles: ['pemilik', 'kasir'] },
    { to: '/dashboard', icon: BarChart3, label: 'Ringkasan', roles: ['pemilik', 'kasir'] },
    { to: '/reports', icon: FileBarChart, label: 'Laporan', roles: ['pemilik'] },
    { to: '/stock', icon: Boxes, label: 'Stok', roles: ['pemilik'] },
    { to: '/users', icon: Users, label: 'Karyawan', roles: ['pemilik'] },
    { to: '/settings', icon: Settings, label: 'Pengaturan', roles: ['pemilik'] },
  ];

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(
    (item) => item.roles.includes(user?.role || 'kasir')
  );

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-bold text-gray-900 truncate" data-testid="store-name">
                {tenant?.name || 'AIKasir'}
              </h1>
              <p className="text-xs text-gray-500 truncate">
                {tenant?.subdomain ? `${tenant.subdomain}.aikasir.com` : 'AIKasir'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {filteredNavItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`
                  }
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              user?.role === 'pemilik' 
                ? 'bg-purple-100' 
                : 'bg-blue-100'
            }`}>
              <span className={`font-semibold ${
                user?.role === 'pemilik' 
                  ? 'text-purple-600' 
                  : 'text-blue-600'
              }`}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate" data-testid="user-name">
                {user?.name || 'User'}
              </p>
              <p className={`text-xs capitalize ${
                user?.role === 'pemilik' 
                  ? 'text-purple-500' 
                  : 'text-blue-500'
              }`}>
                {user?.role}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all"
            data-testid="logout-btn"
          >
            <LogOut className="w-5 h-5" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
};

export default Layout;

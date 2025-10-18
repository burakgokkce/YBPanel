'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from './Sidebar';
import { User } from '@/types';
import { Bell, Search, Settings, LogOut, User as UserIcon } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';

interface DashboardLayoutProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'project_manager' | 'member';
}

export default function DashboardLayout({ children, requiredRole }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      
      if (requiredRole && parsedUser.role !== requiredRole) {
        // Proje yöneticisi admin sayfalarına erişebilir ama üye tablosu hariç
        if (!(requiredRole === 'admin' && parsedUser.role === 'project_manager')) {
          router.push('/');
          return;
        }
      }

      setUser(parsedUser);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/');
      return;
    } finally {
      setIsLoading(false);
    }
  }, [router, requiredRole]);

  // Listen for localStorage changes to update profile picture
  useEffect(() => {
    const handleStorageChange = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing updated user data:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (for same-tab updates)
    const handleUserUpdate = (event: CustomEvent) => {
      setUser(event.detail);
    };

    window.addEventListener('userUpdated', handleUserUpdate as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdated', handleUserUpdate as EventListener);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Başarıyla çıkış yapıldı');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark-bg flex">
      <Sidebar userRole={user.role} />
      <main className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="bg-dark-card border-b border-dark-border px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img 
                src="/yb-digital-logo.svg" 
                alt="YB Digital" 
                className="w-8 h-8"
              />
              <h1 className="text-xl font-bold text-white">YB Digital</h1>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Ara..."
                  className="pl-10 pr-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:border-accent transition-colors w-64"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-dark-bg transition-colors"
                >
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture.startsWith('/uploads/') ? `http://localhost:5002${user.profilePicture}` : user.profilePicture}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-accent/20"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-accent to-highlight rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {getInitials(user.name)}
                    </div>
                  )}
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                  </div>
                </button>

                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-dark-card border border-dark-border rounded-lg shadow-lg z-50">
                    <div className="py-2">
                      {user.role === 'member' && (
                        <Link
                          href="/member/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-dark-bg transition-colors"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <UserIcon className="w-4 h-4 mr-3" />
                          Profil
                        </Link>
                      )}
                      <Link
                        href={user.role === 'admin' ? '/admin/settings' : '/member/settings'}
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-dark-bg transition-colors"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Ayarlar
                      </Link>
                      <hr className="my-2 border-dark-border" />
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          handleLogout();
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-dark-bg transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Çıkış Yap
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

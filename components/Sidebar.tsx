'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Users, 
  MessageSquare, 
  CheckSquare, 
  Calendar, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Shield,
  User,
  LayoutDashboard,
  Mail
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SidebarProps {
  userRole: 'admin' | 'project_manager' | 'member';
}

export default function Sidebar({ userRole }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const adminMenuItems = [
    { icon: LayoutDashboard, label: 'Panel', href: '/admin', exact: true },
    { icon: Users, label: 'Üyeler', href: '/admin/members' },
    { icon: BarChart3, label: 'Üye Tablosu', href: '/admin/members-table' },
    { icon: Shield, label: 'Ekip', href: '/admin/team' },
    { icon: MessageSquare, label: 'Duyurular', href: '/admin/announcements' },
    { icon: CheckSquare, label: 'Görevler', href: '/admin/tasks' },
    { icon: Calendar, label: 'Toplantılar', href: '/admin/meetings' },
    { icon: Mail, label: 'E-posta Gönder', href: '/admin/email' },
    { icon: Settings, label: 'Ayarlar', href: '/admin/settings' },
  ];

  const memberMenuItems = [
    { icon: LayoutDashboard, label: 'Panel', href: '/member', exact: true },
    { icon: CheckSquare, label: 'Görevlerim', href: '/member/tasks' },
    { icon: MessageSquare, label: 'Duyurular', href: '/member/announcements' },
    { icon: Calendar, label: 'Toplantılar', href: '/member/meetings' },
    { icon: Mail, label: 'E-posta Gönder', href: '/member/email' },
    { icon: User, label: 'Profil', href: '/member/profile' },
  ];

  const projectManagerMenuItems = [
    { icon: LayoutDashboard, label: 'Kontrol Paneli', href: '/project-manager', exact: true },
    { icon: Users, label: 'Ekip Yönetimi', href: '/project-manager/team' },
    { icon: CheckSquare, label: 'Görev Yönetimi', href: '/project-manager/tasks' },
    { icon: MessageSquare, label: 'Duyuru Yönetimi', href: '/project-manager/announcements' },
    { icon: Calendar, label: 'Toplantı Yönetimi', href: '/project-manager/meetings' },
    { icon: Mail, label: 'E-posta Gönder', href: '/project-manager/email' },
    { icon: BarChart3, label: 'Raporlar', href: '/project-manager/reports' },
    { icon: Settings, label: 'Sistem Ayarları', href: '/project-manager/settings' },
    { icon: User, label: 'Profil Ayarları', href: '/project-manager/profile' },
  ];

  const menuItems = userRole === 'admin' ? adminMenuItems : 
                   userRole === 'project_manager' ? projectManagerMenuItems : 
                   memberMenuItems;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Başarıyla çıkış yapıldı');
    router.push('/');
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-dark-card border-r border-dark-border z-50 transition-all duration-300
        ${isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'w-64'}
        lg:relative lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-dark-border">
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                {/* YB Digital Logo */}
                <img 
                  src="/yb-digital-logo.svg" 
                  alt="YB Digital" 
                  className="w-8 h-8"
                />
                <div>
                  <h2 className="font-semibold text-lg">YB Digital</h2>
                  <p className="text-sm text-gray-400 capitalize">{userRole} Panel</p>
                </div>
              </div>
            )}
            {isCollapsed && (
              <div className="flex items-center justify-center w-full">
                <img 
                  src="/yb-digital-logo.svg" 
                  alt="YB Digital" 
                  className="w-8 h-8"
                />
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-dark-bg transition-colors lg:hidden"
            >
              {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, item.exact);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${active 
                      ? `${userRole === 'admin' ? 'bg-accent text-white' : 'bg-highlight text-white'}` 
                      : 'text-gray-300 hover:bg-dark-bg hover:text-white'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                  onClick={() => setIsCollapsed(true)}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-dark-border">
            <button
              onClick={handleLogout}
              className={`
                flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-colors
                text-gray-300 hover:bg-red-500/20 hover:text-red-400
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">Çıkış</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <button
        onClick={() => setIsCollapsed(false)}
        className="fixed top-4 left-4 z-30 p-2 bg-dark-card border border-dark-border rounded-lg lg:hidden"
      >
        <Menu className="w-5 h-5" />
      </button>
    </>
  );
}

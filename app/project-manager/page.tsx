'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Users, 
  CheckSquare, 
  Calendar, 
  MessageSquare,
  TrendingUp,
  Clock,
  Target,
  Award,
  BarChart3,
  Activity
} from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

export default function ProjectManagerDashboard() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalMeetings: 0,
    totalAnnouncements: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, activitiesResponse] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/activities')
      ]);

      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }

      if (activitiesResponse.data.success) {
        setRecentActivities(activitiesResponse.data.data);
      }
    } catch (error) {
      console.error('Dashboard data error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout requiredRole="project_manager">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-dark-card rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-dark-card rounded-xl"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const completionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  return (
    <DashboardLayout requiredRole="project_manager">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Proje Yöneticisi Kontrol Paneli</h1>
          <p className="text-gray-400">Ekibinizi ve projelerinizi yönetin</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/project-manager/team" className="block">
            <div className="bg-dark-card border border-dark-border rounded-xl p-6 hover:border-accent/50 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Toplam Ekip Üyesi</p>
                  <p className="text-2xl font-bold">{stats.totalMembers}</p>
                  <p className="text-xs text-green-400 mt-1">
                    {stats.activeMembers} aktif üye
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </div>
          </Link>

          <Link href="/project-manager/tasks" className="block">
            <div className="bg-dark-card border border-dark-border rounded-xl p-6 hover:border-accent/50 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Toplam Görev</p>
                  <p className="text-2xl font-bold">{stats.totalTasks}</p>
                  <p className="text-xs text-accent mt-1">
                    %{completionRate} tamamlandı
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <CheckSquare className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </div>
          </Link>

          <Link href="/project-manager/meetings" className="block">
            <div className="bg-dark-card border border-dark-border rounded-xl p-6 hover:border-accent/50 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Toplam Toplantı</p>
                  <p className="text-2xl font-bold">{stats.totalMeetings}</p>
                  <p className="text-xs text-blue-400 mt-1">
                    Bu ay planlandı
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </div>
          </Link>

          <Link href="/project-manager/announcements" className="block">
            <div className="bg-dark-card border border-dark-border rounded-xl p-6 hover:border-accent/50 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Toplam Duyuru</p>
                  <p className="text-2xl font-bold">{stats.totalAnnouncements}</p>
                  <p className="text-xs text-yellow-400 mt-1">
                    Aktif duyurular
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-dark-card border border-dark-border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-accent" />
              Proje Performansı
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Görev Tamamlanma Oranı</span>
                  <span className="text-sm font-semibold">{completionRate}%</span>
                </div>
                <div className="w-full bg-dark-bg rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-accent to-highlight h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Ekip Aktivite Oranı</span>
                  <span className="text-sm font-semibold">
                    {stats.totalMembers > 0 ? Math.round((stats.activeMembers / stats.totalMembers) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-dark-bg rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${stats.totalMembers > 0 ? Math.round((stats.activeMembers / stats.totalMembers) * 100) : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-dark-border">
              <div className="text-center">
                <div className="flex items-center justify-center w-10 h-10 bg-green-500/20 rounded-lg mx-auto mb-2">
                  <Target className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-sm text-gray-400">Tamamlanan</p>
                <p className="text-lg font-semibold text-green-400">{stats.completedTasks}</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-10 h-10 bg-yellow-500/20 rounded-lg mx-auto mb-2">
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
                <p className="text-sm text-gray-400">Bekleyen</p>
                <p className="text-lg font-semibold text-yellow-400">{stats.pendingTasks}</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-500/20 rounded-lg mx-auto mb-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-sm text-gray-400">Toplam</p>
                <p className="text-lg font-semibold text-blue-400">{stats.totalTasks}</p>
              </div>
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-accent" />
              Hızlı Eylemler
            </h3>
            
            <div className="space-y-3">
              <Link 
                href="/project-manager/tasks" 
                className="flex items-center p-3 bg-dark-bg rounded-lg hover:bg-dark-border transition-colors"
              >
                <CheckSquare className="w-4 h-4 mr-3 text-purple-400" />
                <span className="text-sm">Yeni Görev Oluştur</span>
              </Link>
              
              <Link 
                href="/project-manager/meetings" 
                className="flex items-center p-3 bg-dark-bg rounded-lg hover:bg-dark-border transition-colors"
              >
                <Calendar className="w-4 h-4 mr-3 text-green-400" />
                <span className="text-sm">Toplantı Planla</span>
              </Link>
              
              <Link 
                href="/project-manager/announcements" 
                className="flex items-center p-3 bg-dark-bg rounded-lg hover:bg-dark-border transition-colors"
              >
                <MessageSquare className="w-4 h-4 mr-3 text-yellow-400" />
                <span className="text-sm">Duyuru Yayınla</span>
              </Link>
              
              <Link 
                href="/project-manager/team" 
                className="flex items-center p-3 bg-dark-bg rounded-lg hover:bg-dark-border transition-colors"
              >
                <Users className="w-4 h-4 mr-3 text-blue-400" />
                <span className="text-sm">Ekip Yönetimi</span>
              </Link>
              
              <Link 
                href="/project-manager/email" 
                className="flex items-center p-3 bg-dark-bg rounded-lg hover:bg-dark-border transition-colors"
              >
                <MessageSquare className="w-4 h-4 mr-3 text-accent" />
                <span className="text-sm">E-posta Gönder</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-accent/10 to-highlight/10 border border-accent/20 rounded-xl p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Proje Yöneticisi Paneline Hoş Geldiniz!</h3>
              <p className="text-gray-400 text-sm">
                Ekibinizi yönetin, görevleri takip edin ve projelerin başarısını artırın.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

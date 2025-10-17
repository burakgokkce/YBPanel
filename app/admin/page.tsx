'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Users, CheckSquare, MessageSquare, Calendar, TrendingUp, Activity } from 'lucide-react';
import api from '@/lib/api';
import { DashboardStats } from '@/types';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<any>(null);
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
        setActivities(activitiesResponse.data.data);
      }
    } catch (error: any) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Toplam Üye',
      value: stats?.totalMembers || 0,
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/20',
    },
    {
      title: 'Aktif Üye',
      value: stats?.activeMembers || 0,
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-400/20',
    },
    {
      title: 'Toplam Görev',
      value: stats?.totalTasks || 0,
      icon: CheckSquare,
      color: 'text-accent',
      bgColor: 'bg-accent/20',
    },
    {
      title: 'Tamamlanan Görev',
      value: stats?.completedTasks || 0,
      icon: Activity,
      color: 'text-highlight',
      bgColor: 'bg-highlight/20',
    },
    {
      title: 'Duyuru',
      value: stats?.totalAnnouncements || 0,
      icon: MessageSquare,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/20',
    },
    {
      title: 'Toplantı',
      value: stats?.upcomingMeetings || 0,
      icon: Calendar,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/20',
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout requiredRole="admin">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-dark-card rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-dark-card rounded-xl"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Yönetici Paneli</h1>
          <p className="text-gray-400">Tekrar hoş geldiniz! Takımınızda neler oluyor, buradan takip edin.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="bg-dark-card border border-dark-border rounded-xl p-6 hover:border-accent/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">{card.title}</p>
                    <p className="text-2xl font-bold mt-1">{card.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${card.bgColor}`}>
                    <Icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Activities */}
        {activities && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Users */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-400" />
                Recent Members
              </h3>
              <div className="space-y-3">
                {activities.recentUsers?.length > 0 ? (
                  activities.recentUsers.map((user: any) => (
                    <div key={user._id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No recent members</p>
                )}
              </div>
            </div>

            {/* Recent Tasks */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <CheckSquare className="w-5 h-5 mr-2 text-accent" />
                Recent Tasks
              </h3>
              <div className="space-y-3">
                {activities.recentTasks?.length > 0 ? (
                  activities.recentTasks.map((task: any) => (
                    <div key={task._id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-gray-400">by {task.createdByName}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        task.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No recent tasks</p>
                )}
              </div>
            </div>

            {/* Recent Announcements */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-yellow-400" />
                Recent Announcements
              </h3>
              <div className="space-y-3">
                {activities.recentAnnouncements?.length > 0 ? (
                  activities.recentAnnouncements.map((announcement: any) => (
                    <div key={announcement._id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{announcement.title}</p>
                        <p className="text-sm text-gray-400">by {announcement.createdByName}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No recent announcements</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-accent/20 hover:bg-accent/30 rounded-xl transition-colors text-center">
              <Users className="w-6 h-6 text-accent mx-auto mb-2" />
              <span className="text-sm font-medium">Add Member</span>
            </button>
            <button className="p-4 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-xl transition-colors text-center">
              <MessageSquare className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <span className="text-sm font-medium">New Announcement</span>
            </button>
            <button className="p-4 bg-highlight/20 hover:bg-highlight/30 rounded-xl transition-colors text-center">
              <CheckSquare className="w-6 h-6 text-highlight mx-auto mb-2" />
              <span className="text-sm font-medium">Assign Task</span>
            </button>
            <button className="p-4 bg-purple-500/20 hover:bg-purple-500/30 rounded-xl transition-colors text-center">
              <Calendar className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <span className="text-sm font-medium">Schedule Meeting</span>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  MessageSquare, 
  Bell,
  Search,
  Calendar,
  User,
  AlertCircle,
  Info,
  CheckCircle
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { formatDate, formatDateTime } from '@/lib/utils';

interface Announcement {
  _id: string;
  title: string;
  description: string;
  isImportant: boolean;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export default function MemberAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterImportant, setFilterImportant] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    filterAnnouncements();
  }, [announcements, searchTerm, filterImportant]);

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get('/announcements');
      if (response.data.success) {
        setAnnouncements(response.data.data);
      }
    } catch (error: any) {
      toast.error('Duyurular yüklenemedi');
      console.error('Announcements error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAnnouncements = () => {
    let filtered = announcements;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(announcement =>
        announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        announcement.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        announcement.createdByName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Important filter
    if (filterImportant) {
      filtered = filtered.filter(announcement => announcement.isImportant);
    }

    setFilteredAnnouncements(filtered);
  };

  if (isLoading) {
    return (
      <DashboardLayout requiredRole="member">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-dark-card rounded w-1/4"></div>
          <div className="h-12 bg-dark-card rounded"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-dark-card rounded-xl"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="member">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Duyurular</h1>
            <p className="text-gray-400">Şirket duyurularını ve önemli bilgileri takip edin</p>
          </div>
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-8 h-8 text-highlight" />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Duyuru ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:border-highlight transition-colors"
              />
            </div>

            {/* Important Filter */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filterImportant}
                onChange={(e) => setFilterImportant(e.target.checked)}
                className="w-4 h-4 text-highlight bg-dark-bg border-dark-border rounded focus:ring-highlight focus:ring-2"
              />
              <span className="text-sm font-medium">Sadece Önemli Duyurular</span>
            </label>

            {/* Results Count */}
            <div className="flex items-center text-gray-400">
              <span className="text-sm">{filteredAnnouncements.length} duyuru</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Toplam Duyuru</p>
                <p className="text-2xl font-bold mt-1">{announcements.length}</p>
              </div>
              <div className="p-3 rounded-full bg-highlight/20">
                <MessageSquare className="w-6 h-6 text-highlight" />
              </div>
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Önemli Duyuru</p>
                <p className="text-2xl font-bold mt-1">{announcements.filter(a => a.isImportant).length}</p>
              </div>
              <div className="p-3 rounded-full bg-red-500/20">
                <Bell className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Bu Ay</p>
                <p className="text-2xl font-bold mt-1">
                  {announcements.filter(a => {
                    const announcementDate = new Date(a.createdAt);
                    const currentDate = new Date();
                    return announcementDate.getMonth() === currentDate.getMonth() &&
                           announcementDate.getFullYear() === currentDate.getFullYear();
                  }).length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-500/20">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Announcements List */}
        <div className="space-y-4">
          {filteredAnnouncements.length > 0 ? (
            filteredAnnouncements.map((announcement) => (
              <div
                key={announcement._id}
                className={`bg-dark-card border rounded-xl p-6 hover:border-highlight/50 transition-colors ${
                  announcement.isImportant ? 'border-red-500/50 bg-red-500/5' : 'border-dark-border'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    {announcement.isImportant ? (
                      <div className="p-2 rounded-full bg-red-500/20">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      </div>
                    ) : (
                      <div className="p-2 rounded-full bg-highlight/20">
                        <Info className="w-5 h-5 text-highlight" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">{announcement.title}</h3>
                      {announcement.isImportant && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded-full">
                          <Bell className="w-3 h-3 mr-1" />
                          Önemli
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="ml-11">
                  <p className="text-gray-300 mb-4 leading-relaxed">{announcement.description}</p>
                  
                  {/* Footer */}
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>{announcement.createdByName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDateTime(announcement.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm || filterImportant ? 'Duyuru bulunamadı' : 'Henüz duyuru yok'}
              </h3>
              <p className="text-gray-400">
                {searchTerm || filterImportant 
                  ? 'Arama kriterlerinizi değiştirmeyi deneyin.'
                  : 'Yeni duyurular burada görünecek.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

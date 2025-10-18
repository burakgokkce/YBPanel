'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Calendar, 
  Clock,
  MapPin,
  Users,
  ExternalLink,
  Search,
  Filter,
  User,
  Video,
  CalendarDays
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { formatDate, formatDateTime } from '@/lib/utils';

interface Meeting {
  _id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  location?: string;
  link?: string;
  attendees: string[];
  attendeeNames?: string[];
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export default function MemberMeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');

  useEffect(() => {
    fetchMeetings();
  }, []);

  useEffect(() => {
    filterMeetings();
  }, [meetings, searchTerm, timeFilter]);

  const fetchMeetings = async () => {
    try {
      const response = await api.get('/meetings');
      if (response.data.success) {
        setMeetings(response.data.data);
      }
    } catch (error: any) {
      toast.error('Toplantılar yüklenemedi');
      console.error('Meetings error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterMeetings = () => {
    let filtered = meetings;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(meeting =>
        meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.createdByName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Time filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    if (timeFilter === 'today') {
      filtered = filtered.filter(meeting => {
        const meetingDate = new Date(meeting.date);
        return meetingDate >= today && meetingDate < tomorrow;
      });
    } else if (timeFilter === 'upcoming') {
      filtered = filtered.filter(meeting => {
        const meetingDate = new Date(meeting.date);
        return meetingDate >= today;
      });
    } else if (timeFilter === 'this_week') {
      filtered = filtered.filter(meeting => {
        const meetingDate = new Date(meeting.date);
        return meetingDate >= today && meetingDate < nextWeek;
      });
    } else if (timeFilter === 'past') {
      filtered = filtered.filter(meeting => {
        const meetingDate = new Date(meeting.date);
        return meetingDate < today;
      });
    }

    // Sort by date
    filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setFilteredMeetings(filtered);
  };

  const getMeetingStatus = (meeting: Meeting) => {
    const now = new Date();
    const meetingDateTime = new Date(`${meeting.date}T${meeting.time}`);
    
    if (meetingDateTime < now) {
      return { status: 'past', label: 'Geçmiş', color: 'bg-gray-500/20 text-gray-400' };
    } else if (meetingDateTime.toDateString() === now.toDateString()) {
      return { status: 'today', label: 'Bugün', color: 'bg-blue-500/20 text-blue-400' };
    } else {
      return { status: 'upcoming', label: 'Yaklaşan', color: 'bg-green-500/20 text-green-400' };
    }
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

  const upcomingMeetings = meetings.filter(meeting => new Date(meeting.date) >= new Date());
  const todayMeetings = meetings.filter(meeting => {
    const today = new Date();
    const meetingDate = new Date(meeting.date);
    return meetingDate.toDateString() === today.toDateString();
  });

  return (
    <DashboardLayout requiredRole="member">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Toplantılar</h1>
            <p className="text-gray-400">Toplantı programınızı görüntüleyin ve yönetin</p>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-8 h-8 text-highlight" />
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
                placeholder="Toplantı ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:border-highlight transition-colors"
              />
            </div>

            {/* Time Filter */}
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:border-highlight transition-colors"
            >
              <option value="all">Tüm Toplantılar</option>
              <option value="today">Bugün</option>
              <option value="upcoming">Yaklaşan</option>
              <option value="this_week">Bu Hafta</option>
              <option value="past">Geçmiş</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center text-gray-400">
              <Filter className="w-4 h-4 mr-2" />
              <span>{filteredMeetings.length} toplantı</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Toplam Toplantı</p>
                <p className="text-2xl font-bold mt-1">{meetings.length}</p>
              </div>
              <div className="p-3 rounded-full bg-highlight/20">
                <Calendar className="w-6 h-6 text-highlight" />
              </div>
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Bugün</p>
                <p className="text-2xl font-bold mt-1">{todayMeetings.length}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-500/20">
                <CalendarDays className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Yaklaşan</p>
                <p className="text-2xl font-bold mt-1">{upcomingMeetings.length}</p>
              </div>
              <div className="p-3 rounded-full bg-green-500/20">
                <Clock className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Meetings List */}
        <div className="space-y-4">
          {filteredMeetings.length > 0 ? (
            filteredMeetings.map((meeting) => {
              const status = getMeetingStatus(meeting);
              return (
                <div
                  key={meeting._id}
                  className="bg-dark-card border border-dark-border rounded-xl p-6 hover:border-highlight/50 transition-colors"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-full bg-highlight/20">
                        <Calendar className="w-5 h-5 text-highlight" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">{meeting.title}</h3>
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="ml-11">
                    {meeting.description && (
                      <p className="text-gray-300 mb-4 leading-relaxed">{meeting.description}</p>
                    )}
                    
                    {/* Meeting Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(meeting.date)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{meeting.time}</span>
                      </div>
                      {meeting.location && (
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <MapPin className="w-4 h-4" />
                          <span>{meeting.location}</span>
                        </div>
                      )}
                      {meeting.attendeeNames && meeting.attendeeNames.length > 0 && (
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <Users className="w-4 h-4" />
                          <span>{meeting.attendeeNames.length} katılımcı</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <User className="w-4 h-4" />
                        <span>Düzenleyen: {meeting.createdByName}</span>
                      </div>
                      
                      {meeting.link && (
                        <a
                          href={meeting.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 px-4 py-2 bg-highlight/20 text-highlight rounded-lg hover:bg-highlight/30 transition-colors"
                        >
                          <Video className="w-4 h-4" />
                          <span>Toplantıya Katıl</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {/* Attendees */}
                    {meeting.attendeeNames && meeting.attendeeNames.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-dark-border">
                        <h4 className="text-sm font-medium mb-2">Katılımcılar:</h4>
                        <div className="flex flex-wrap gap-2">
                          {meeting.attendeeNames.map((name, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-dark-bg border border-dark-border rounded-full"
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm || timeFilter !== 'all' ? 'Toplantı bulunamadı' : 'Henüz toplantı yok'}
              </h3>
              <p className="text-gray-400">
                {searchTerm || timeFilter !== 'all'
                  ? 'Arama kriterlerinizi değiştirmeyi deneyin.'
                  : 'Yeni toplantılar burada görünecek.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

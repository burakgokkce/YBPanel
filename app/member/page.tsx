'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  CheckSquare, 
  MessageSquare, 
  Calendar, 
  User, 
  Clock, 
  TrendingUp,
  Bell,
  Target
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { formatDate, formatDateTime, getInitials } from '@/lib/utils';

export default function MemberDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/member');
      
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error: any) {
      toast.error('Failed to load dashboard data');
      console.error('Member dashboard error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, { status: newStatus });
      
      if (response.data.success) {
        toast.success('Task status updated successfully');
        fetchDashboardData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update task');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout requiredRole="member">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-dark-card rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-48 bg-dark-card rounded-xl"></div>
            <div className="lg:col-span-2 h-48 bg-dark-card rounded-xl"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { profile, myTasks, teamTasks, announcements, upcomingMeetings, stats } = dashboardData || {};

  return (
    <DashboardLayout requiredRole="member">
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {profile?.name}!</h1>
            <p className="text-gray-400">Here's what's happening in your workspace today.</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-highlight/20 rounded-full flex items-center justify-center">
              <span className="text-highlight font-semibold">
                {profile?.name ? getInitials(profile.name) : 'U'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">My Tasks</p>
                <p className="text-2xl font-bold mt-1">{stats?.myTasksCount || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-highlight/20">
                <CheckSquare className="w-6 h-6 text-highlight" />
              </div>
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold mt-1">{stats?.completedTasksCount || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-green-500/20">
                <Target className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold mt-1">{stats?.pendingTasksCount || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-500/20">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-highlight" />
              My Profile
            </h3>
            <div className="text-center mb-4">
              <div className="w-20 h-20 bg-highlight/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-highlight font-semibold text-xl">
                  {profile?.name ? getInitials(profile.name) : 'U'}
                </span>
              </div>
              <h4 className="font-semibold">{profile?.name}</h4>
              <p className="text-gray-400 text-sm">{profile?.position || 'Team Member'}</p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span>{profile?.email}</span>
              </div>
              {profile?.department && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Department:</span>
                  <span>{profile.department}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Joined:</span>
                <span>{profile?.joinDate ? formatDate(profile.joinDate) : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* My Tasks */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <CheckSquare className="w-5 h-5 mr-2 text-highlight" />
              My Tasks
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {myTasks?.length > 0 ? (
                myTasks.map((task: any) => (
                  <div key={task._id} className="border border-dark-border rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        task.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs mb-2">{task.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 text-xs rounded ${
                        task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {task.priority}
                      </span>
                      {task.status !== 'completed' && (
                        <select
                          value={task.status}
                          onChange={(e) => handleTaskStatusUpdate(task._id, e.target.value)}
                          className="text-xs bg-dark-bg border border-dark-border rounded px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm text-center py-4">No tasks assigned</p>
              )}
            </div>
          </div>

          {/* Team Tasks */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-accent" />
              Team Tasks
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {teamTasks?.length > 0 ? (
                teamTasks.map((task: any) => (
                  <div key={task._id} className="border border-dark-border rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        task.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs mb-2">{task.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Team: {task.team}</span>
                      <span className={`px-2 py-1 text-xs rounded ${
                        task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm text-center py-4">No team tasks available</p>
              )}
            </div>
          </div>
        </div>

        {/* Announcements & Meetings */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Announcements */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-yellow-400" />
              Recent Announcements
            </h3>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {announcements?.length > 0 ? (
                announcements.map((announcement: any) => (
                  <div key={announcement._id} className="border border-dark-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{announcement.title}</h4>
                      {announcement.isImportant && (
                        <Bell className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{announcement.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>By {announcement.createdByName}</span>
                      <span>{formatDate(announcement.createdAt)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm text-center py-4">No announcements</p>
              )}
            </div>
          </div>

          {/* Upcoming Meetings */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-purple-400" />
              Upcoming Meetings
            </h3>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {upcomingMeetings?.length > 0 ? (
                upcomingMeetings.map((meeting: any) => (
                  <div key={meeting._id} className="border border-dark-border rounded-lg p-4">
                    <h4 className="font-medium mb-2">{meeting.title}</h4>
                    {meeting.description && (
                      <p className="text-gray-400 text-sm mb-2">{meeting.description}</p>
                    )}
                    <div className="space-y-1 text-xs text-gray-500">
                      <div>📅 {formatDate(meeting.date)} at {meeting.time}</div>
                      {meeting.link && (
                        <div>
                          🔗 <a href={meeting.link} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                            Join Meeting
                          </a>
                        </div>
                      )}
                      <div>👤 By {meeting.createdByName}</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm text-center py-4">No upcoming meetings</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Clock,
  Link as LinkIcon,
  Users,
  X,
  Video
} from 'lucide-react';
import api from '@/lib/api';
import { Meeting, User as UserType } from '@/types';
import toast from 'react-hot-toast';
import { formatDate, formatDateTime } from '@/lib/utils';

function isUpcoming(date: Date | string) {
  const now = new Date();
  const meetingDate = new Date(date);
  return meetingDate >= now;
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    link: '',
    notes: '',
    attendees: [] as string[]
  });

  useEffect(() => {
    fetchMeetings();
    fetchUsers();
  }, []);

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

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Users error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.date || !formData.time) {
      toast.error('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    try {
      const meetingData = {
        ...formData,
        date: new Date(formData.date + 'T' + formData.time),
        attendees: formData.attendees
      };

      const url = editingMeeting ? `/meetings/${editingMeeting._id}` : '/meetings';
      const method = editingMeeting ? 'put' : 'post';

      const response = await api[method](url, meetingData);
      
      if (response.data.success) {
        toast.success(`Toplantı ${editingMeeting ? 'güncellendi' : 'oluşturuldu'}`);
        
        // Send email invitations if attendees are selected
        if (formData.attendees.length > 0) {
          try {
            const attendeeEmails = users
              .filter(user => formData.attendees.includes(user._id))
              .map(user => user.email);

            await api.post('/email/send-meeting-invitation', {
              meetingTitle: formData.title,
              meetingDate: formData.date,
              meetingTime: formData.time,
              meetingLink: formData.link,
              attendeeEmails: attendeeEmails,
              notes: formData.notes
            });

            toast.success(`E-posta davetleri ${attendeeEmails.length} kişiye gönderildi`);
          } catch (emailError) {
            console.error('Email sending failed:', emailError);
            toast.error('Toplantı oluşturuldu ancak e-posta gönderilemedi');
          }
        }

        setShowModal(false);
        setEditingMeeting(null);
        setFormData({
          title: '',
          description: '',
          date: '',
          time: '',
          link: '',
          notes: '',
          attendees: []
        });
        fetchMeetings();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Toplantı kaydedilemedi');
    }
  };

  const handleEdit = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setFormData({
      title: meeting.title,
      description: meeting.description || '',
      date: new Date(meeting.date).toISOString().split('T')[0],
      time: meeting.time,
      link: meeting.link || '',
      notes: meeting.notes || '',
      attendees: meeting.attendees || []
    });
    setShowModal(true);
  };

  const handleDelete = async (meetingId: string) => {
    if (!confirm('Are you sure you want to delete this meeting?')) return;

    try {
      const response = await api.delete(`/meetings/${meetingId}`);
      if (response.data.success) {
        toast.success('Meeting deleted successfully');
        fetchMeetings();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete meeting');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingMeeting(null);
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      link: '',
      notes: '',
      attendees: []
    });
  };

  const isUpcoming = (date: string) => {
    return new Date(date) >= new Date();
  };

  if (isLoading) {
    return (
      <DashboardLayout requiredRole="admin">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-dark-card rounded w-1/4"></div>
          <div className="h-12 bg-dark-card rounded"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-dark-card rounded"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Meeting Management</h1>
            <p className="text-gray-400">Schedule and manage team meetings</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Meeting</span>
          </button>
        </div>

        {/* Meetings List */}
        <div className="space-y-4">
          {meetings.length > 0 ? (
            meetings.map((meeting) => (
              <div
                key={meeting._id}
                className={`bg-dark-card border rounded-xl p-6 transition-colors ${
                  isUpcoming(meeting.date) 
                    ? 'border-accent/50 hover:border-accent' 
                    : 'border-dark-border hover:border-gray-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{meeting.title}</h3>
                      {isUpcoming(meeting.date) && (
                        <span className="bg-accent/20 text-accent px-2 py-1 text-xs rounded-full">
                          Upcoming
                        </span>
                      )}
                    </div>
                    
                    {meeting.description && (
                      <p className="text-gray-300 mb-3">{meeting.description}</p>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{formatDate(meeting.date)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{meeting.time}</span>
                      </div>
                      {meeting.link && (
                        <div className="flex items-center">
                          <Video className="w-4 h-4 mr-2" />
                          <a 
                            href={meeting.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-accent hover:underline"
                          >
                            Join Meeting
                          </a>
                        </div>
                      )}
                      <div className="flex items-center">
                        <span>Created by: {meeting.createdByName}</span>
                      </div>
                    </div>

                    {meeting.notes && (
                      <div className="mt-3 p-3 bg-dark-bg rounded-lg">
                        <p className="text-sm text-gray-300">
                          <strong>Notes:</strong> {meeting.notes}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(meeting)}
                      className="p-2 hover:bg-dark-bg rounded-lg transition-colors text-gray-400 hover:text-white"
                      title="Edit Meeting"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(meeting._id)}
                      className="p-2 hover:bg-dark-bg rounded-lg transition-colors text-red-400 hover:text-red-300"
                      title="Delete Meeting"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-dark-card border border-dark-border rounded-xl">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No meetings scheduled</p>
              <button 
                onClick={() => setShowModal(true)}
                className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-xl transition-colors"
              >
                Schedule First Meeting
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">
                {editingMeeting ? 'Edit Meeting' : 'Schedule Meeting'}
              </h3>
              <button
                onClick={handleModalClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  placeholder="Enter meeting title"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors resize-none"
                  placeholder="Enter meeting description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    id="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="time" className="block text-sm font-medium mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    id="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="link" className="block text-sm font-medium mb-2">
                  Meeting Link
                </label>
                <input
                  type="url"
                  id="link"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  placeholder="https://zoom.us/j/... or Google Meet link"
                />
              </div>

              <div>
                <label htmlFor="attendees" className="block text-sm font-medium mb-2">
                  Attendees
                </label>
                <select
                  multiple
                  id="attendees"
                  value={formData.attendees}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    setFormData({ ...formData, attendees: values });
                  }}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  size={4}
                >
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Hold Ctrl/Cmd to select multiple attendees</p>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium mb-2">
                  Notes
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors resize-none"
                  placeholder="Meeting agenda, preparation notes, etc."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="flex-1 px-4 py-2 border border-dark-border text-gray-300 rounded-xl hover:bg-dark-bg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-xl transition-colors"
                >
                  {editingMeeting ? 'Update' : 'Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

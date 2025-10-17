'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  MessageSquare, 
  Plus, 
  Edit, 
  Trash2, 
  Bell, 
  Calendar,
  User,
  X
} from 'lucide-react';
import api from '@/lib/api';
import { Announcement } from '@/types';
import toast from 'react-hot-toast';
import { formatDateTime } from '@/lib/utils';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isImportant: false
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get('/announcements', {
        params: { limit: 50 }
      });

      if (response.data.success) {
        setAnnouncements(response.data.data);
      }
    } catch (error: any) {
      toast.error('Failed to load announcements');
      console.error('Announcements error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const url = editingAnnouncement 
        ? `/announcements/${editingAnnouncement._id}` 
        : '/announcements';
      const method = editingAnnouncement ? 'put' : 'post';

      const response = await api[method](url, formData);
      
      if (response.data.success) {
        toast.success(`Announcement ${editingAnnouncement ? 'updated' : 'created'} successfully`);
        setShowModal(false);
        setEditingAnnouncement(null);
        setFormData({ title: '', description: '', isImportant: false });
        fetchAnnouncements();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save announcement');
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      description: announcement.description,
      isImportant: announcement.isImportant
    });
    setShowModal(true);
  };

  const handleDelete = async (announcementId: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      const response = await api.delete(`/announcements/${announcementId}`);
      if (response.data.success) {
        toast.success('Announcement deleted successfully');
        fetchAnnouncements();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete announcement');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingAnnouncement(null);
    setFormData({ title: '', description: '', isImportant: false });
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
            <h1 className="text-3xl font-bold mb-2">Announcements</h1>
            <p className="text-gray-400">Manage company announcements and notifications</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Announcement</span>
          </button>
        </div>

        {/* Announcements List */}
        <div className="space-y-4">
          {announcements.length > 0 ? (
            announcements.map((announcement) => (
              <div
                key={announcement._id}
                className="bg-dark-card border border-dark-border rounded-xl p-6 hover:border-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{announcement.title}</h3>
                      {announcement.isImportant && (
                        <span className="bg-red-500/20 text-red-400 px-2 py-1 text-xs rounded-full flex items-center">
                          <Bell className="w-3 h-3 mr-1" />
                          Important
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300 mb-4">{announcement.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        <span>{announcement.createdByName}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{formatDateTime(announcement.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="p-2 hover:bg-dark-bg rounded-lg transition-colors text-gray-400 hover:text-white"
                      title="Edit Announcement"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(announcement._id)}
                      className="p-2 hover:bg-dark-bg rounded-lg transition-colors text-red-400 hover:text-red-300"
                      title="Delete Announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-dark-card border border-dark-border rounded-xl">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No announcements yet</p>
              <button 
                onClick={() => setShowModal(true)}
                className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-xl transition-colors"
              >
                Create First Announcement
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">
                {editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}
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
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  placeholder="Enter announcement title"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors resize-none"
                  placeholder="Enter announcement description"
                  required
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isImportant"
                  checked={formData.isImportant}
                  onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
                  className="w-4 h-4 text-accent bg-dark-bg border-dark-border rounded focus:ring-accent focus:ring-2"
                />
                <label htmlFor="isImportant" className="text-sm font-medium flex items-center">
                  <Bell className="w-4 h-4 mr-1 text-red-400" />
                  Mark as Important
                </label>
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
                  {editingAnnouncement ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

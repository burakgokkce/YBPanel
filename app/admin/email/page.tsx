'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Mail, 
  Send, 
  Users, 
  User,
  CheckSquare,
  X,
  Plus
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  department?: string;
  role: string;
}

export default function AdminEmailPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/users');
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error: any) {
      toast.error('Kullanıcılar yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user._id));
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim()) {
      toast.error('Konu başlığı gerekli');
      return;
    }

    if (!message.trim()) {
      toast.error('Mesaj içeriği gerekli');
      return;
    }

    if (selectedUsers.length === 0) {
      toast.error('En az bir alıcı seçmelisiniz');
      return;
    }

    setIsSending(true);

    try {
      const selectedUserEmails = users
        .filter(user => selectedUsers.includes(user._id))
        .map(user => user.email);

      const response = await api.post('/email/send-notification', {
        subject,
        message,
        recipients: selectedUserEmails
      });

      if (response.data.success) {
        toast.success(`E-posta ${selectedUsers.length} kişiye gönderildi`);
        setSubject('');
        setMessage('');
        setSelectedUsers([]);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'E-posta gönderilemedi');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout requiredRole="admin">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-dark-card rounded w-1/4"></div>
          <div className="h-96 bg-dark-card rounded-xl"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">E-posta Gönder</h1>
          <p className="text-gray-400">Üyelere toplu veya tekil e-posta gönderin</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recipients Selection */}
          <div className="lg:col-span-1">
            <div className="bg-dark-card border border-dark-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Users className="w-5 h-5 mr-2 text-accent" />
                  Alıcılar ({selectedUsers.length})
                </h3>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-accent hover:text-accent/80 transition-colors"
                >
                  {selectedUsers.length === users.length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {users.map(user => (
                  <label
                    key={user._id}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-dark-bg cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => handleUserToggle(user._id)}
                      className="w-4 h-4 text-accent bg-dark-bg border-dark-border rounded focus:ring-accent focus:ring-2"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center text-accent text-xs font-semibold">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{user.name}</p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                      </div>
                      {user.department && (
                        <p className="text-xs text-gray-500 mt-1">{user.department}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-red-500/20 text-red-400' 
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {user.role === 'admin' ? 'Admin' : 'Üye'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Email Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSendEmail} className="bg-dark-card border border-dark-border rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-highlight" />
                  E-posta Oluştur
                </h3>
                {selectedUsers.length > 0 && (
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <CheckSquare className="w-4 h-4" />
                    <span>{selectedUsers.length} alıcı seçildi</span>
                  </div>
                )}
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2">
                  Konu *
                </label>
                <input
                  type="text"
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  placeholder="E-posta konusunu girin..."
                  required
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Mesaj *
                </label>
                <textarea
                  id="message"
                  rows={12}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors resize-none"
                  placeholder="Mesajınızı buraya yazın..."
                  required
                />
                <p className="text-xs text-gray-400 mt-2">
                  Mesajınız HTML formatında gönderilecektir. Satır sonları otomatik olarak dönüştürülür.
                </p>
              </div>

              {/* Selected Recipients Preview */}
              {selectedUsers.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Seçili Alıcılar ({selectedUsers.length})
                  </label>
                  <div className="flex flex-wrap gap-2 p-3 bg-dark-bg border border-dark-border rounded-lg max-h-32 overflow-y-auto">
                    {users
                      .filter(user => selectedUsers.includes(user._id))
                      .map(user => (
                        <span
                          key={user._id}
                          className="inline-flex items-center space-x-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-sm"
                        >
                          <span>{user.name}</span>
                          <button
                            type="button"
                            onClick={() => handleUserToggle(user._id)}
                            className="hover:text-accent/70 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))
                    }
                  </div>
                </div>
              )}

              {/* Send Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSending || selectedUsers.length === 0}
                  className="bg-accent hover:bg-accent/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl transition-colors flex items-center space-x-2"
                >
                  {isSending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Gönderiliyor...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>E-posta Gönder</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

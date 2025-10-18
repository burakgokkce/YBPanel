'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  User, 
  Camera, 
  Save, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Briefcase,
  Calendar,
  CreditCard,
  Trash2
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { getInitials } from '@/lib/utils';

export default function AdminProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    department: '',
    position: '',
    iban: '',
    birthDate: '',
    startDate: ''
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData({
        firstName: parsedUser.firstName || '',
        lastName: parsedUser.lastName || '',
        email: parsedUser.email || '',
        phone: parsedUser.phone || '',
        address: parsedUser.address || '',
        department: parsedUser.department || '',
        position: parsedUser.position || '',
        iban: parsedUser.iban || '',
        birthDate: parsedUser.birthDate ? new Date(parsedUser.birthDate).toISOString().split('T')[0] : '',
        startDate: parsedUser.startDate ? new Date(parsedUser.startDate).toISOString().split('T')[0] : ''
      });
    }
    setIsLoading(false);
  }, []);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const response = await api.post('/users/upload-profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const updatedUser = { ...user, profilePicture: response.data.data.profilePicture };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Dispatch custom event to update header
        window.dispatchEvent(new CustomEvent('userUpdated', { detail: updatedUser }));
        
        toast.success('Profil resmi başarıyla yüklendi');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Profil resmi yüklenemedi');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePhotoDelete = async () => {
    try {
      const response = await api.delete('/users/delete-profile-picture');
      
      if (response.data.success) {
        const updatedUser = { ...user, profilePicture: '' };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Dispatch custom event to update header
        window.dispatchEvent(new CustomEvent('userUpdated', { detail: updatedUser }));
        
        toast.success('Profil resmi silindi');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Profil resmi silinemedi');
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const response = await api.put(`/users/${user._id}`, formData);
      
      if (response.data.success) {
        const updatedUser = { ...user, ...formData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Dispatch custom event to update header
        window.dispatchEvent(new CustomEvent('userUpdated', { detail: updatedUser }));
        
        toast.success('Profil bilgileri güncellendi');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Profil güncellenemedi');
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
          <h1 className="text-3xl font-bold mb-2">Profil Ayarları</h1>
          <p className="text-gray-400">Kişisel bilgilerinizi yönetin</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Picture Section */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Profil Resmi</h3>
            
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {user?.profilePicture ? (
                  <img
                    src={`http://localhost:5002${user.profilePicture}`}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-dark-border"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-accent to-highlight flex items-center justify-center text-white text-2xl font-bold border-4 border-dark-border">
                    {getInitials(user?.firstName, user?.lastName)}
                  </div>
                )}
                
                <label className="absolute bottom-0 right-0 bg-accent hover:bg-accent/90 text-white p-2 rounded-full cursor-pointer transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>
              
              <div className="text-center">
                <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
                <p className="text-sm text-gray-400">{user?.role === 'admin' ? 'Yönetici' : user?.role === 'project_manager' ? 'Proje Yöneticisi' : 'Üye'}</p>
              </div>
              
              {user?.profilePicture && (
                <button
                  onClick={handlePhotoDelete}
                  className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Resmi Sil</span>
                </button>
              )}
            </div>
          </div>

          {/* Profile Information */}
          <div className="lg:col-span-2 bg-dark-card border border-dark-border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-6">Kişisel Bilgiler</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Ad</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Soyad</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">E-posta</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Telefon</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Departman</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  >
                    <option value="">Departman seçin</option>
                    <option value="iOS">iOS</option>
                    <option value="Android">Android</option>
                    <option value="Backend">Backend</option>
                    <option value="Web">Web</option>
                    <option value="Mobil">Mobil</option>
                    <option value="Tasarım">Tasarım</option>
                    <option value="Test">Test</option>
                    <option value="Proje Yönetimi">Proje Yönetimi</option>
                    <option value="Yönetim">Yönetim</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Pozisyon</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">IBAN</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.iban}
                    onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Doğum Tarihi</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">İşe Başlama Tarihi</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">Adres</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <textarea
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors resize-none"
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={handleProfileUpdate}
                className="flex items-center space-x-2 bg-accent hover:bg-accent/90 text-white px-6 py-3 rounded-xl transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Değişiklikleri Kaydet</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

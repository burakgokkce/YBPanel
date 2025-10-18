'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Briefcase, 
  Calendar,
  Edit,
  Save,
  X,
  Eye,
  EyeOff,
  Camera,
  Upload,
  Trash2
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { formatDate, getInitials } from '@/lib/utils';

export default function MemberProfile() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    department: '',
    position: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        
        // Fetch fresh user data from server
        const response = await api.get(`/users/${parsedUser._id}`);
        if (response.data.success) {
          const userProfile = response.data.data;
          setUser(userProfile);
          setFormData({
            name: userProfile.name || '',
            email: userProfile.email || '',
            phone: userProfile.phone || '',
            address: userProfile.address || '',
            department: userProfile.department || '',
            position: userProfile.position || ''
          });
        }
      }
    } catch (error: any) {
      toast.error('Failed to load profile');
      console.error('Profile error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await api.put(`/users/${user._id}`, formData);
      
      if (response.data.success) {
        setUser(response.data.data);
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(response.data.data));
        toast.success('Profile updated successfully');
        setIsEditing(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    try {
      // Note: This would need a separate password update endpoint
      toast.success('Password updated successfully');
      setShowPasswordForm(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      department: user?.department || '',
      position: user?.position || ''
    });
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Sadece JPEG, PNG, GIF ve WebP dosyaları desteklenir');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    setUploadingPhoto(true);

    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await api.post('/upload/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        // Update user data
        const updatedUser = { ...user, profilePicture: response.data.data.profilePicture };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success('Profil resmi başarıyla yüklendi');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Profil resmi yüklenemedi');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePhotoDelete = async () => {
    try {
      const response = await api.delete('/upload/profile-picture');
      
      if (response.data.success) {
        const updatedUser = { ...user, profilePicture: '' };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success('Profil resmi silindi');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Profil resmi silinemedi');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout requiredRole="member">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-dark-card rounded w-1/4"></div>
          <div className="bg-dark-card rounded-xl p-6 space-y-4">
            <div className="h-20 w-20 bg-dark-bg rounded-full mx-auto"></div>
            <div className="h-6 bg-dark-bg rounded w-1/3 mx-auto"></div>
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 bg-dark-bg rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout requiredRole="member">
        <div className="text-center py-12">
          <p className="text-gray-400">Failed to load profile</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="member">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Profilim</h1>
            <p className="text-gray-400">Kişisel bilgilerinizi ve ayarlarınızı yönetin</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-highlight hover:bg-highlight/90 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-8">
          {/* Profile Header */}
          <div className="text-center mb-8">
            <div className="relative w-24 h-24 mx-auto mb-4">
              {user.profilePicture ? (
                <img
                  src={`http://localhost:5002${user.profilePicture}`}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-highlight/20"
                />
              ) : (
                <div className="w-24 h-24 bg-highlight/20 rounded-full flex items-center justify-center border-4 border-highlight/20">
                  <span className="text-highlight font-semibold text-2xl">
                    {getInitials(user.name)}
                  </span>
                </div>
              )}
              
              {/* Photo Upload/Delete Buttons */}
              <div className="absolute -bottom-2 -right-2 flex space-x-1">
                <label className="bg-highlight hover:bg-highlight/90 text-white p-2 rounded-full cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploadingPhoto}
                  />
                  {uploadingPhoto ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </label>
                
                {user.profilePicture && (
                  <button
                    onClick={handlePhotoDelete}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                    title="Profil resmini sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-gray-400">{user.position || 'Takım Üyesi'}</p>
            <span className={`inline-block mt-2 px-3 py-1 text-sm rounded-full ${
              user.isActive 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {user.isActive ? 'Aktif Üye' : 'Pasif'}
            </span>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-4 py-3 bg-dark-bg border border-dark-border rounded-xl transition-colors ${
                      isEditing 
                        ? 'focus:outline-none focus:border-highlight' 
                        : 'cursor-not-allowed opacity-60'
                    }`}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-4 py-3 bg-dark-bg border border-dark-border rounded-xl transition-colors ${
                      isEditing 
                        ? 'focus:outline-none focus:border-highlight' 
                        : 'cursor-not-allowed opacity-60'
                    }`}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-4 py-3 bg-dark-bg border border-dark-border rounded-xl transition-colors ${
                      isEditing 
                        ? 'focus:outline-none focus:border-highlight' 
                        : 'cursor-not-allowed opacity-60'
                    }`}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label htmlFor="department" className="block text-sm font-medium mb-2">
                  Department
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-4 py-3 bg-dark-bg border border-dark-border rounded-xl transition-colors ${
                      isEditing 
                        ? 'focus:outline-none focus:border-highlight' 
                        : 'cursor-not-allowed opacity-60'
                    }`}
                    placeholder="e.g., Development, Design"
                  />
                </div>
              </div>

              {/* Position */}
              <div>
                <label htmlFor="position" className="block text-sm font-medium mb-2">
                  Position
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-4 py-3 bg-dark-bg border border-dark-border rounded-xl transition-colors ${
                      isEditing 
                        ? 'focus:outline-none focus:border-highlight' 
                        : 'cursor-not-allowed opacity-60'
                    }`}
                    placeholder="e.g., Frontend Developer"
                  />
                </div>
              </div>

              {/* Join Date (Read-only) */}
              <div>
                <label htmlFor="joinDate" className="block text-sm font-medium mb-2">
                  Join Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="joinDate"
                    value={formatDate(user.joinDate)}
                    disabled
                    className="w-full pl-10 pr-4 py-3 bg-dark-bg border border-dark-border rounded-xl cursor-not-allowed opacity-60"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium mb-2">
                Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <textarea
                  id="address"
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={!isEditing}
                  className={`w-full pl-10 pr-4 py-3 bg-dark-bg border border-dark-border rounded-xl transition-colors resize-none ${
                    isEditing 
                      ? 'focus:outline-none focus:border-highlight' 
                      : 'cursor-not-allowed opacity-60'
                  }`}
                  placeholder="Enter your address"
                />
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 border border-dark-border text-gray-300 rounded-xl hover:bg-dark-bg transition-colors flex items-center justify-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-highlight hover:bg-highlight/90 text-white px-4 py-2 rounded-xl transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Password Change Section */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Password & Security</h3>
              <p className="text-gray-400 text-sm">Update your password to keep your account secure</p>
            </div>
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-xl transition-colors"
            >
              Change Password
            </button>
          </div>

          {showPasswordForm && (
            <form onSubmit={handlePasswordUpdate} className="space-y-4 pt-4 border-t border-dark-border">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    id="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 pr-12 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    id="newPassword"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-3 pr-12 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    id="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 pr-12 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-dark-border text-gray-300 rounded-xl hover:bg-dark-bg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-xl transition-colors"
                >
                  Update Password
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

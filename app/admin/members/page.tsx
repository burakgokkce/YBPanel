'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  Building,
  Briefcase,
  Upload,
  X,
  Save,
  Camera
} from 'lucide-react';
import api from '@/lib/api';
import { User } from '@/types';
import toast from 'react-hot-toast';
import { formatDate, getInitials } from '@/lib/utils';

export default function MembersTablePage() {
  const [members, setMembers] = useState<User[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [editingMember, setEditingMember] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null);

  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    department: '',
    position: '',
    profilePicture: '',
    iban: '',
    birthDate: '',
    startDate: ''
  });

  const departments = ['iOS', 'Android', 'Backend', 'Web', 'Mobil', 'Tasarım', 'Test', 'Proje Yönetimi', 'Yönetim'];

  useEffect(() => {
    // Proje yöneticisi üye tablosuna erişemez
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.role === 'project_manager') {
        window.location.href = '/admin';
        return;
      }
    }
    
    fetchMembers();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [members, searchTerm, selectedDepartment, selectedStatus]);

  const fetchMembers = async () => {
    try {
      const response = await api.get('/users');
      if (response.data.success) {
        setMembers(response.data.data);
      }
    } catch (error: any) {
      toast.error('Üyeler yüklenemedi');
      console.error('Members error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterMembers = () => {
    let filtered = [...members];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(member => 
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.position?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Department filter
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(member => member.department === selectedDepartment);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(member => 
        selectedStatus === 'active' ? member.isActive : !member.isActive
      );
    }

    setFilteredMembers(filtered);
  };

  const handleEdit = (member: User) => {
    setEditingMember(member);
    setEditFormData({
      firstName: member.firstName || '',
      lastName: member.lastName || '',
      email: member.email,
      phone: member.phone || '',
      address: member.address || '',
      department: member.department || '',
      position: member.position || '',
      profilePicture: member.profilePicture || '',
      iban: member.iban || '',
      birthDate: member.birthDate ? new Date(member.birthDate).toISOString().split('T')[0] : '',
      startDate: member.startDate ? new Date(member.startDate).toISOString().split('T')[0] : ''
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingMember) return;

    try {
      console.log('Saving edit data:', editFormData);
      const response = await api.put(`/users/${editingMember._id}`, editFormData);
      console.log('Edit response:', response.data);
      if (response.data.success) {
        toast.success('Üye bilgileri güncellendi');
        setShowEditModal(false);
        setEditingMember(null);
        fetchMembers();
      }
    } catch (error: any) {
      console.error('Edit error:', error);
      toast.error(error.response?.data?.message || 'Güncelleme başarısız');
    }
  };

  const handleDelete = async (memberId: string) => {
    if (!confirm('Bu üyeyi silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await api.delete(`/users/${memberId}`);
      if (response.data.success) {
        toast.success('Üye başarıyla silindi');
        fetchMembers();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Üye silinemedi');
    }
  };

  const handleToggleStatus = async (member: User) => {
    try {
      const response = await api.put(`/users/${member._id}`, {
        isActive: !member.isActive
      });
      
      if (response.data.success) {
        toast.success(`Üye ${!member.isActive ? 'aktif' : 'pasif'} edildi`);
        fetchMembers();
      }
    } catch (error: any) {
      toast.error('Durum güncellenemedi');
    }
  };

  const handlePhotoUpload = async (memberId: string, file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Sadece JPEG, PNG, GIF ve WebP dosyaları desteklenir');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    setUploadingPhoto(memberId);

    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      // Upload the file using admin endpoint
      const uploadResponse = await api.post(`/upload/profile-picture/${memberId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (uploadResponse.data.success) {
        toast.success('Profil resmi güncellendi');
        fetchMembers();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Resim yüklenemedi');
    } finally {
      setUploadingPhoto(null);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Üye Tablosu</h1>
            <p className="text-gray-400">Tüm üyeleri tablo formatında görüntüleyin ve düzenleyin</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Üye ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {/* Department Filter */}
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
            >
              <option value="all">Tüm Departmanlar</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>
          </div>
        </div>

        {/* Members Table */}
        <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-bg border-b border-dark-border">
                <tr>
                  <th className="text-left p-4 font-semibold">Profil</th>
                  <th className="text-left p-4 font-semibold">Ad Soyad</th>
                  <th className="text-left p-4 font-semibold">E-posta</th>
                  <th className="text-left p-4 font-semibold">Departman</th>
                  <th className="text-left p-4 font-semibold">Pozisyon</th>
                  <th className="text-left p-4 font-semibold">Telefon</th>
                  <th className="text-left p-4 font-semibold">IBAN</th>
                  <th className="text-left p-4 font-semibold">Doğum</th>
                  <th className="text-left p-4 font-semibold">İşe Başlama</th>
                  <th className="text-left p-4 font-semibold">Durum</th>
                  <th className="text-left p-4 font-semibold">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member, index) => (
                  <tr key={member._id} className={`border-b border-dark-border hover:bg-dark-bg/50 transition-colors ${index % 2 === 0 ? 'bg-dark-bg/20' : ''}`}>
                    {/* Profile Picture */}
                    <td className="p-4">
                      <div className="relative group">
                        {member.profilePicture ? (
                          <img
                            src={member.profilePicture.startsWith('/uploads/') ? `http://localhost:5002${member.profilePicture}` : member.profilePicture}
                            alt={member.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-accent/20"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-accent to-highlight rounded-full flex items-center justify-center text-white font-bold border-2 border-accent/20">
                            {getInitials(member.name)}
                          </div>
                        )}
                        
                        {/* Upload overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                          <label htmlFor={`photo-${member._id}`} className="cursor-pointer">
                            {uploadingPhoto === member._id ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                              <Camera className="w-5 h-5 text-white" />
                            )}
                          </label>
                          <input
                            id={`photo-${member._id}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handlePhotoUpload(member._id, file);
                              }
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Name */}
                    <td className="p-4">
                      <div>
                        <div className="font-semibold">{member.name}</div>
                        <div className="text-sm text-gray-400">{member.role === 'admin' ? 'Yönetici' : 'Üye'}</div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="p-4">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm">{member.email}</span>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="p-4">
                      <span className="px-2 py-1 bg-accent/20 text-accent rounded-full text-xs">
                        {member.department || 'Belirtilmemiş'}
                      </span>
                    </td>

                    {/* Position */}
                    <td className="p-4">
                      <span className="text-sm">{member.position || '-'}</span>
                    </td>

                    {/* Phone */}
                    <td className="p-4">
                      <div className="flex items-center">
                        {member.phone ? (
                          <>
                            <Phone className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm">{member.phone}</span>
                          </>
                        ) : (
                          <span className="text-gray-500 text-sm">-</span>
                        )}
                      </div>
                    </td>

                    {/* IBAN */}
                    <td className="p-4">
                      <span className="text-sm font-mono">
                        {member.iban ? 
                          `${member.iban.substring(0, 8)}****${member.iban.substring(member.iban.length - 4)}` 
                          : '-'
                        }
                      </span>
                    </td>

                    {/* Birth Date */}
                    <td className="p-4">
                      <span className="text-sm">
                        {member.birthDate ? formatDate(member.birthDate) : '-'}
                      </span>
                    </td>

                    {/* Start Date */}
                    <td className="p-4">
                      <span className="text-sm">
                        {member.startDate ? formatDate(member.startDate) : '-'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(member)}
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${
                          member.isActive 
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                            : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        }`}
                      >
                        {member.isActive ? 'Aktif' : 'Pasif'}
                      </button>
                    </td>

                    {/* Join Date */}
                    <td className="p-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm">{formatDate(member.joinDate)}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(member)}
                          className="p-2 hover:bg-dark-bg rounded-lg transition-colors text-blue-400 hover:text-blue-300"
                          title="Düzenle"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {member.role !== 'admin' && (
                          <button
                            onClick={() => handleDelete(member._id)}
                            className="p-2 hover:bg-dark-bg rounded-lg transition-colors text-red-400 hover:text-red-300"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredMembers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Üye bulunamadı</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-dark-card border border-dark-border rounded-xl p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Toplam Üye</h3>
            <p className="text-2xl font-bold">{members.length}</p>
          </div>
          <div className="bg-dark-card border border-dark-border rounded-xl p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Aktif Üye</h3>
            <p className="text-2xl font-bold text-green-400">{members.filter(m => m.isActive).length}</p>
          </div>
          <div className="bg-dark-card border border-dark-border rounded-xl p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Yönetici</h3>
            <p className="text-2xl font-bold text-accent">{members.filter(m => m.role === 'admin').length}</p>
          </div>
          <div className="bg-dark-card border border-dark-border rounded-xl p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Departman</h3>
            <p className="text-2xl font-bold text-highlight">{new Set(members.map(m => m.department).filter(Boolean)).size}</p>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Üye Bilgilerini Düzenle</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Ad</label>
                  <input
                    type="text"
                    value={editFormData.firstName}
                    onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Soyad</label>
                  <input
                    type="text"
                    value={editFormData.lastName}
                    onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">E-posta</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Departman</label>
                  <select
                    value={editFormData.department}
                    onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  >
                    <option value="">Departman seçin</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Pozisyon</label>
                  <input
                    type="text"
                    value={editFormData.position}
                    onChange={(e) => setEditFormData({ ...editFormData, position: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Telefon</label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">IBAN</label>
                <input
                  type="text"
                  value={editFormData.iban}
                  onChange={(e) => setEditFormData({ ...editFormData, iban: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Doğum Tarihi</label>
                  <input
                    type="date"
                    value={editFormData.birthDate}
                    onChange={(e) => setEditFormData({ ...editFormData, birthDate: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">İşe Başlama Tarihi</label>
                  <input
                    type="date"
                    value={editFormData.startDate}
                    onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Adres</label>
                <textarea
                  rows={3}
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors resize-none"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-dark-border text-gray-300 rounded-xl hover:bg-dark-bg transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-xl transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Kaydet</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

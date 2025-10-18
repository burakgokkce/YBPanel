'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Users, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  Building,
  Briefcase,
  Crown,
  Star,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Eye,
  UserPlus,
  UserMinus,
  Shield,
  Save,
  X
} from 'lucide-react';
import api from '@/lib/api';
import { User } from '@/types';
import toast from 'react-hot-toast';
import { formatDate, getInitials } from '@/lib/utils';

export default function TeamPage() {
  const [members, setMembers] = useState<User[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState<User | null>(null);
  const [newMemberData, setNewMemberData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    department: '',
    position: '',
    role: 'member' as 'admin' | 'project_manager' | 'member'
  });

  const departments = ['iOS', 'Android', 'Backend', 'Web', 'Mobil', 'Tasarım', 'Test', 'Proje Yönetimi', 'Yönetim'];

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [members, searchTerm, selectedDepartment, selectedRole]);

  const fetchMembers = async () => {
    try {
      const response = await api.get('/users');
      if (response.data.success) {
        setMembers(response.data.data);
      }
    } catch (error: any) {
      toast.error('Ekip üyeleri yüklenemedi');
      console.error('Members error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterMembers = () => {
    let filtered = members;

    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.position?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDepartment) {
      filtered = filtered.filter(member => member.department === selectedDepartment);
    }

    if (selectedRole) {
      filtered = filtered.filter(member => member.role === selectedRole);
    }

    setFilteredMembers(filtered);
  };

  const handleAddMember = async () => {
    try {
      const response = await api.post('/auth/register', newMemberData);
      if (response.data.success) {
        toast.success('Yeni üye başarıyla eklendi');
        setShowAddModal(false);
        setNewMemberData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          phone: '',
          address: '',
          department: '',
          position: '',
          role: 'member'
        });
        fetchMembers();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Üye eklenemedi');
    }
  };

  const handleEditMember = async () => {
    if (!editingMember) return;

    try {
      const response = await api.put(`/users/${editingMember._id}`, {
        firstName: editingMember.firstName,
        lastName: editingMember.lastName,
        email: editingMember.email,
        phone: editingMember.phone,
        address: editingMember.address,
        department: editingMember.department,
        position: editingMember.position,
        role: editingMember.role
      });
      
      if (response.data.success) {
        toast.success('Üye bilgileri güncellendi');
        setShowEditModal(false);
        setEditingMember(null);
        fetchMembers();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Güncelleme başarısız');
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Bu üyeyi silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await api.delete(`/users/${memberId}`);
      if (response.data.success) {
        toast.success('Üye başarıyla silindi');
        fetchMembers();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Silme işlemi başarısız');
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
      toast.error('Durum değiştirilemedi');
    }
  };

  const openEditModal = (member: User) => {
    setEditingMember(member);
    setShowEditModal(true);
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
            <h1 className="text-3xl font-bold mb-2">Ekip Yönetimi</h1>
            <p className="text-gray-400">Takım üyelerini yönetin ve organize edin</p>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-xl transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Yeni Üye</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
            >
              <option value="">Tüm Departmanlar</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
            >
              <option value="">Tüm Roller</option>
              <option value="admin">Yönetici</option>
              <option value="project_manager">Proje Yöneticisi</option>
              <option value="member">Üye</option>
            </select>
            
            <div className="text-sm text-gray-400 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              {filteredMembers.length} üye
            </div>
          </div>
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map(member => (
            <div key={member._id} className="bg-dark-card border border-dark-border rounded-xl p-6 hover:border-accent/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {member.profilePicture ? (
                    <img
                      src={`http://localhost:5002${member.profilePicture}`}
                      alt={member.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-accent to-highlight rounded-full flex items-center justify-center text-white font-semibold">
                      {getInitials(member.firstName, member.lastName)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{member.firstName} {member.lastName}</h3>
                    <p className="text-sm text-gray-400">{member.position || 'Pozisyon belirtilmemiş'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {member.role === 'admin' && (
                    <Crown className="w-4 h-4 text-red-400" title="Yönetici" />
                  )}
                  {member.role === 'project_manager' && (
                    <Shield className="w-4 h-4 text-blue-400" title="Proje Yöneticisi" />
                  )}
                  <div className={`w-3 h-3 rounded-full ${member.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-400">
                  <Mail className="w-4 h-4 mr-2" />
                  {member.email}
                </div>
                {member.phone && (
                  <div className="flex items-center text-sm text-gray-400">
                    <Phone className="w-4 h-4 mr-2" />
                    {member.phone}
                  </div>
                )}
                {member.department && (
                  <div className="flex items-center text-sm text-gray-400">
                    <Building className="w-4 h-4 mr-2" />
                    {member.department}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-400">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDate(member.joinDate || member.createdAt)}
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-dark-border">
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
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEditModal(member)}
                    className="p-2 text-gray-400 hover:text-accent transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMember(member._id)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <h3 className="text-lg font-semibold mb-2">Üye bulunamadı</h3>
            <p className="text-gray-400 mb-4">Arama kriterlerinize uygun üye bulunmuyor</p>
          </div>
        )}

        {/* Add Member Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-card border border-dark-border rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Yeni Üye Ekle</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Ad</label>
                  <input
                    type="text"
                    value={newMemberData.firstName}
                    onChange={(e) => setNewMemberData({ ...newMemberData, firstName: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Soyad</label>
                  <input
                    type="text"
                    value={newMemberData.lastName}
                    onChange={(e) => setNewMemberData({ ...newMemberData, lastName: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">E-posta</label>
                  <input
                    type="email"
                    value={newMemberData.email}
                    onChange={(e) => setNewMemberData({ ...newMemberData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Şifre</label>
                  <input
                    type="password"
                    value={newMemberData.password}
                    onChange={(e) => setNewMemberData({ ...newMemberData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Telefon</label>
                  <input
                    type="tel"
                    value={newMemberData.phone}
                    onChange={(e) => setNewMemberData({ ...newMemberData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Departman</label>
                  <select
                    value={newMemberData.department}
                    onChange={(e) => setNewMemberData({ ...newMemberData, department: e.target.value })}
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
                    value={newMemberData.position}
                    onChange={(e) => setNewMemberData({ ...newMemberData, position: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Rol</label>
                  <select
                    value={newMemberData.role}
                    onChange={(e) => setNewMemberData({ ...newMemberData, role: e.target.value as 'admin' | 'project_manager' | 'member' })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  >
                    <option value="member">Üye</option>
                    <option value="project_manager">Proje Yöneticisi</option>
                    <option value="admin">Yönetici</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 mt-4">Adres</label>
                <textarea
                  rows={3}
                  value={newMemberData.address}
                  onChange={(e) => setNewMemberData({ ...newMemberData, address: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors resize-none"
                />
              </div>

              <div className="flex space-x-3 pt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-dark-border text-gray-300 rounded-xl hover:bg-dark-bg transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleAddMember}
                  className="flex-1 bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-xl transition-colors flex items-center justify-center space-x-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Üye Ekle</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Member Modal */}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Ad</label>
                  <input
                    type="text"
                    value={editingMember.firstName || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, firstName: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Soyad</label>
                  <input
                    type="text"
                    value={editingMember.lastName || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, lastName: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">E-posta</label>
                  <input
                    type="email"
                    value={editingMember.email}
                    onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Telefon</label>
                  <input
                    type="tel"
                    value={editingMember.phone || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Departman</label>
                  <select
                    value={editingMember.department || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, department: e.target.value })}
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
                    value={editingMember.position || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, position: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Rol</label>
                  <select
                    value={editingMember.role}
                    onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value as 'admin' | 'project_manager' | 'member' })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  >
                    <option value="member">Üye</option>
                    <option value="project_manager">Proje Yöneticisi</option>
                    <option value="admin">Yönetici</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 mt-4">Adres</label>
                <textarea
                  rows={3}
                  value={editingMember.address || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, address: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors resize-none"
                />
              </div>

              <div className="flex space-x-3 pt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-dark-border text-gray-300 rounded-xl hover:bg-dark-bg transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleEditMember}
                  className="flex-1 bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-xl transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Kaydet</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

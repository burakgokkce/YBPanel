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
  Briefcase
} from 'lucide-react';
import api from '@/lib/api';
import { User } from '@/types';
import toast from 'react-hot-toast';
import { formatDate, getInitials } from '@/lib/utils';

export default function MembersPage() {
  const [members, setMembers] = useState<User[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editMemberData, setEditMemberData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    department: '',
    position: '',
    role: 'member' as 'admin' | 'member',
    isActive: true
  });
  const [newMemberData, setNewMemberData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    department: '',
    position: '',
    role: 'member' as 'admin' | 'member'
  });

  useEffect(() => {
    fetchMembers();
    fetchDepartments();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [members, searchTerm, selectedDepartment, selectedStatus]);

  const fetchMembers = async () => {
    try {
      const response = await api.get('/users', {
        params: {
          search: searchTerm,
          department: selectedDepartment,
          status: selectedStatus
        }
      });

      if (response.data.success) {
        setMembers(response.data.data);
      }
    } catch (error: any) {
      toast.error('Failed to load members');
      console.error('Members error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/users/meta/departments');
      if (response.data.success) {
        setDepartments(response.data.data);
      }
    } catch (error) {
      console.error('Departments error:', error);
    }
  };

  const filterMembers = () => {
    let filtered = members;

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

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMemberData.firstName || !newMemberData.lastName || !newMemberData.email || !newMemberData.password) {
      toast.error('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

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

  const handleToggleStatus = async (member: User) => {
    try {
      const response = await api.put(`/users/${member._id}`, {
        isActive: !member.isActive
      });
      
      if (response.data.success) {
        toast.success(`Member ${member.isActive ? 'deactivated' : 'activated'} successfully`);
        fetchMembers();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update member status');
    }
  };

  const openMemberModal = (member: User) => {
    setSelectedMember(member);
    setShowModal(true);
  };

  const openEditModal = (member: User) => {
    setEditMemberData({
      firstName: member.firstName || '',
      lastName: member.lastName || '',
      email: member.email,
      phone: member.phone || '',
      address: member.address || '',
      department: member.department || '',
      position: member.position || '',
      role: member.role,
      isActive: member.isActive
    });
    setSelectedMember(member);
    setShowEditModal(true);
  };

  const handleEditMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMember || !editMemberData.firstName || !editMemberData.lastName || !editMemberData.email) {
      toast.error('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    try {
      const response = await api.put(`/users/${selectedMember._id}`, editMemberData);
      if (response.data.success) {
        toast.success('Üye başarıyla güncellendi');
        setShowEditModal(false);
        fetchMembers();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Üye güncellenemedi');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout requiredRole="admin">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-dark-card rounded w-1/4"></div>
          <div className="h-12 bg-dark-card rounded"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-dark-card rounded"></div>
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
            <h1 className="text-3xl font-bold mb-2">Ekip Üyeleri</h1>
            <p className="text-gray-400">Ekip üyelerinizi ve bilgilerini yönetin</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Üye Ekle</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {/* Department Filter */}
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:border-accent transition-colors"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:border-accent transition-colors"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center text-gray-400">
              <Filter className="w-4 h-4 mr-2" />
              <span>{filteredMembers.length} members</span>
            </div>
          </div>
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <div
              key={member._id}
              className="bg-dark-card border border-dark-border rounded-xl p-6 hover:border-accent/50 transition-colors"
            >
              {/* Member Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                    <span className="text-accent font-semibold">
                      {getInitials(member.name)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-sm text-gray-400">{member.position || 'Team Member'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => openMemberModal(member)}
                    className="p-2 hover:bg-dark-bg rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => openEditModal(member)}
                    className="p-2 hover:bg-dark-bg rounded-lg transition-colors text-blue-400"
                    title="Edit Member"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(member._id)}
                    className="p-2 hover:bg-dark-bg rounded-lg transition-colors text-red-400"
                    title="Delete Member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Member Info */}
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-400">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>{member.email}</span>
                </div>
                {member.phone && (
                  <div className="flex items-center text-sm text-gray-400">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{member.phone}</span>
                  </div>
                )}
                {member.department && (
                  <div className="flex items-center text-sm text-gray-400">
                    <Building className="w-4 h-4 mr-2" />
                    <span>{member.department}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-400">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Joined {formatDate(member.joinDate)}</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-4 flex items-center justify-between">
                <span className={`px-3 py-1 text-xs rounded-full ${
                  member.isActive 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {member.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No members found</p>
          </div>
        )}
      </div>

      {/* Member Details Modal */}
      {showModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Member Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-accent font-semibold text-xl">
                    {getInitials(selectedMember.name)}
                  </span>
                </div>
                <h4 className="text-lg font-semibold">{selectedMember.name}</h4>
                <p className="text-gray-400">{selectedMember.position || 'Team Member'}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <span>{selectedMember.email}</span>
                </div>
                {selectedMember.phone && (
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <span>{selectedMember.phone}</span>
                  </div>
                )}
                {selectedMember.address && (
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                    <span>{selectedMember.address}</span>
                  </div>
                )}
                {selectedMember.department && (
                  <div className="flex items-center">
                    <Building className="w-5 h-5 text-gray-400 mr-3" />
                    <span>{selectedMember.department}</span>
                  </div>
                )}
                {selectedMember.position && (
                  <div className="flex items-center">
                    <Briefcase className="w-5 h-5 text-gray-400 mr-3" />
                    <span>{selectedMember.position}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <span>Joined {formatDate(selectedMember.joinDate)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-dark-border">
                <span className={`px-3 py-1 text-sm rounded-full ${
                  selectedMember.isActive 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {selectedMember.isActive ? 'Active Member' : 'Inactive Member'}
                </span>
              </div>
            </div>
          </div>
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
                ×
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                    Ad *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={newMemberData.firstName}
                    onChange={(e) => setNewMemberData({ ...newMemberData, firstName: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                    placeholder="Adını girin"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                    Soyad *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={newMemberData.lastName}
                    onChange={(e) => setNewMemberData({ ...newMemberData, lastName: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                    placeholder="Soyadını girin"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  E-posta *
                </label>
                <input
                  type="email"
                  id="email"
                  value={newMemberData.email}
                  onChange={(e) => setNewMemberData({ ...newMemberData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  placeholder="E-posta adresini girin"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Şifre *
                </label>
                <input
                  type="password"
                  id="password"
                  value={newMemberData.password}
                  onChange={(e) => setNewMemberData({ ...newMemberData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  placeholder="Şifre belirleyin"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="department" className="block text-sm font-medium mb-2">
                    Departman
                  </label>
                  <select
                    id="department"
                    value={newMemberData.department}
                    onChange={(e) => setNewMemberData({ ...newMemberData, department: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
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

                <div>
                  <label htmlFor="position" className="block text-sm font-medium mb-2">
                    Pozisyon
                  </label>
                  <input
                    type="text"
                    id="position"
                    value={newMemberData.position}
                    onChange={(e) => setNewMemberData({ ...newMemberData, position: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                    placeholder="Pozisyonu girin"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={newMemberData.phone}
                  onChange={(e) => setNewMemberData({ ...newMemberData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  placeholder="Telefon numarasını girin"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium mb-2">
                  Adres
                </label>
                <textarea
                  id="address"
                  rows={3}
                  value={newMemberData.address}
                  onChange={(e) => setNewMemberData({ ...newMemberData, address: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors resize-none"
                  placeholder="Adresini girin"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium mb-2">
                  Rol
                </label>
                <select
                  id="role"
                  value={newMemberData.role}
                  onChange={(e) => setNewMemberData({ ...newMemberData, role: e.target.value as 'admin' | 'member' })}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                >
                  <option value="member">Üye</option>
                  <option value="admin">Yönetici</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-dark-border text-gray-300 rounded-xl hover:bg-dark-bg transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-xl transition-colors"
                >
                  Üye Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Üye Düzenle</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleEditMember} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="editFirstName" className="block text-sm font-medium mb-2">
                    Ad *
                  </label>
                  <input
                    type="text"
                    id="editFirstName"
                    value={editMemberData.firstName}
                    onChange={(e) => setEditMemberData({ ...editMemberData, firstName: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                    placeholder="Adını girin"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="editLastName" className="block text-sm font-medium mb-2">
                    Soyad *
                  </label>
                  <input
                    type="text"
                    id="editLastName"
                    value={editMemberData.lastName}
                    onChange={(e) => setEditMemberData({ ...editMemberData, lastName: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                    placeholder="Soyadını girin"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="editEmail" className="block text-sm font-medium mb-2">
                  E-posta *
                </label>
                <input
                  type="email"
                  id="editEmail"
                  value={editMemberData.email}
                  onChange={(e) => setEditMemberData({ ...editMemberData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  placeholder="E-posta adresini girin"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="editDepartment" className="block text-sm font-medium mb-2">
                    Departman
                  </label>
                  <select
                    id="editDepartment"
                    value={editMemberData.department}
                    onChange={(e) => setEditMemberData({ ...editMemberData, department: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
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

                <div>
                  <label htmlFor="editPosition" className="block text-sm font-medium mb-2">
                    Pozisyon
                  </label>
                  <input
                    type="text"
                    id="editPosition"
                    value={editMemberData.position}
                    onChange={(e) => setEditMemberData({ ...editMemberData, position: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                    placeholder="Pozisyonu girin"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="editPhone" className="block text-sm font-medium mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  id="editPhone"
                  value={editMemberData.phone}
                  onChange={(e) => setEditMemberData({ ...editMemberData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  placeholder="Telefon numarasını girin"
                />
              </div>

              <div>
                <label htmlFor="editAddress" className="block text-sm font-medium mb-2">
                  Adres
                </label>
                <textarea
                  id="editAddress"
                  rows={3}
                  value={editMemberData.address}
                  onChange={(e) => setEditMemberData({ ...editMemberData, address: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors resize-none"
                  placeholder="Adresini girin"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="editRole" className="block text-sm font-medium mb-2">
                    Rol
                  </label>
                  <select
                    id="editRole"
                    value={editMemberData.role}
                    onChange={(e) => setEditMemberData({ ...editMemberData, role: e.target.value as 'admin' | 'member' })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  >
                    <option value="member">Üye</option>
                    <option value="admin">Yönetici</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="editStatus" className="block text-sm font-medium mb-2">
                    Durum
                  </label>
                  <select
                    id="editStatus"
                    value={editMemberData.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setEditMemberData({ ...editMemberData, isActive: e.target.value === 'active' })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Pasif</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-dark-border text-gray-300 rounded-xl hover:bg-dark-bg transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-xl transition-colors"
                >
                  Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

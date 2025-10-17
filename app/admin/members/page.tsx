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

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to delete this member?')) return;

    try {
      const response = await api.delete(`/users/${memberId}`);
      if (response.data.success) {
        toast.success('Member deleted successfully');
        fetchMembers();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete member');
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
            <h1 className="text-3xl font-bold mb-2">Team Members</h1>
            <p className="text-gray-400">Manage your team members and their information</p>
          </div>
          <button className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
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
                    onClick={() => handleToggleStatus(member)}
                    className={`p-2 hover:bg-dark-bg rounded-lg transition-colors ${
                      member.isActive ? 'text-green-400' : 'text-red-400'
                    }`}
                    title={member.isActive ? 'Deactivate' : 'Activate'}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMember(member._id)}
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
    </DashboardLayout>
  );
}

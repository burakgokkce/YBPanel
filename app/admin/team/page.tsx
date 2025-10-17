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
  Plus
} from 'lucide-react';
import api from '@/lib/api';
import { User } from '@/types';
import toast from 'react-hot-toast';
import { formatDate, getInitials } from '@/lib/utils';

export default function TeamPage() {
  const [members, setMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

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

  const getDepartmentColor = (department: string) => {
    const colors: { [key: string]: string } = {
      'Yönetim': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Proje Yönetimi': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      'Backend': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Web': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'iOS': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      'Android': 'bg-green-600/20 text-green-500 border-green-600/30',
      'Mobil': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      'Tasarım': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      'Test': 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    };
    return colors[department] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getDepartmentIcon = (department: string) => {
    switch (department) {
      case 'Yönetim':
        return <Crown className="w-4 h-4" />;
      case 'Proje Yönetimi':
        return <Briefcase className="w-4 h-4" />;
      case 'Backend':
      case 'Web':
      case 'iOS':
      case 'Android':
      case 'Mobil':
        return <Building className="w-4 h-4" />;
      case 'Tasarım':
        return <Star className="w-4 h-4" />;
      case 'Test':
        return <Users className="w-4 h-4" />;
      default:
        return <Building className="w-4 h-4" />;
    }
  };

  // Departmanlara göre grupla
  const groupedMembers = members.reduce((acc, member) => {
    const dept = member.department || 'Diğer';
    if (!acc[dept]) {
      acc[dept] = [];
    }
    acc[dept].push(member);
    return acc;
  }, {} as { [key: string]: User[] });

  // Departman sıralaması
  const departmentOrder = [
    'Yönetim',
    'Proje Yönetimi', 
    'Backend',
    'Web',
    'iOS',
    'Android',
    'Mobil',
    'Tasarım',
    'Test',
    'Diğer'
  ];

  if (isLoading) {
    return (
      <DashboardLayout requiredRole="admin">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-dark-card rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-dark-card rounded-xl"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-accent to-highlight bg-clip-text text-transparent">
            YB Digital Ekibi
          </h1>
          <p className="text-gray-400 text-lg">
            Toplam {members.length} ekip üyesi • {Object.keys(groupedMembers).length} departman
          </p>
        </div>

        {/* Departmanlar */}
        {departmentOrder.map(department => {
          const deptMembers = groupedMembers[department];
          if (!deptMembers || deptMembers.length === 0) return null;

          return (
            <div key={department} className="space-y-4">
              {/* Departman Başlığı */}
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg border ${getDepartmentColor(department)}`}>
                  {getDepartmentIcon(department)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{department}</h2>
                  <p className="text-gray-400">{deptMembers.length} kişi</p>
                </div>
              </div>

              {/* Ekip Üyeleri */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {deptMembers.map((member) => (
                  <div
                    key={member._id}
                    className="bg-dark-card border border-dark-border rounded-xl p-6 hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10"
                  >
                    {/* Profil Resmi ve Temel Bilgiler */}
                    <div className="text-center mb-4">
                      <div className="relative inline-block">
                        {member.profilePicture ? (
                          <img
                            src={member.profilePicture}
                            alt={member.name}
                            className="w-20 h-20 rounded-full object-cover border-2 border-accent/20"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gradient-to-br from-accent to-highlight rounded-full flex items-center justify-center text-white font-bold text-xl border-2 border-accent/20">
                            {getInitials(member.name)}
                          </div>
                        )}
                        {member.role === 'admin' && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                            <Crown className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-dark-card ${
                          member.isActive ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                      </div>
                      
                      <h3 className="font-bold text-lg mt-3">{member.name}</h3>
                      <p className="text-accent font-medium">{member.position}</p>
                      
                      {/* Departman Badge */}
                      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs border mt-2 ${getDepartmentColor(member.department || 'Diğer')}`}>
                        {getDepartmentIcon(member.department || 'Diğer')}
                        <span>{member.department}</span>
                      </div>
                    </div>

                    {/* İletişim Bilgileri */}
                    <div className="space-y-2 text-sm">
                      {member.email && (
                        <div className="flex items-center space-x-2 text-gray-400">
                          <Mail className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{member.email}</span>
                        </div>
                      )}
                      
                      {member.phone && (
                        <div className="flex items-center space-x-2 text-gray-400">
                          <Phone className="w-4 h-4 flex-shrink-0" />
                          <span>{member.phone}</span>
                        </div>
                      )}
                      
                      {member.address && (
                        <div className="flex items-center space-x-2 text-gray-400">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{member.address}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2 text-gray-400">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>Katılım: {formatDate(member.joinDate)}</span>
                      </div>
                    </div>

                    {/* Aksiyon Butonları */}
                    <div className="flex space-x-2 mt-4 pt-4 border-t border-dark-border">
                      <button className="flex-1 bg-dark-bg hover:bg-accent/20 text-accent border border-accent/20 hover:border-accent/50 px-3 py-2 rounded-lg transition-colors flex items-center justify-center space-x-1">
                        <Edit className="w-4 h-4" />
                        <span className="text-xs">Düzenle</span>
                      </button>
                      {member.role !== 'admin' && (
                        <button className="bg-dark-bg hover:bg-red-500/20 text-red-400 border border-red-400/20 hover:border-red-400/50 px-3 py-2 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Yeni Üye Ekleme Kartı */}
        <div className="bg-dark-card border-2 border-dashed border-dark-border rounded-xl p-8 text-center hover:border-accent/50 transition-colors cursor-pointer">
          <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-accent" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Yeni Ekip Üyesi Ekle</h3>
          <p className="text-gray-400 mb-4">Ekibinize yeni bir üye ekleyin</p>
          <button className="bg-accent hover:bg-accent/90 text-white px-6 py-2 rounded-xl transition-colors">
            Üye Ekle
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

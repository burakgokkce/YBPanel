'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Settings, 
  Globe, 
  Users, 
  Building, 
  Save,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function SettingsPage() {
  const [language, setLanguage] = useState('tr');
  const [departments, setDepartments] = useState([
    'iOS',
    'Android', 
    'Backend',
    'Web',
    'Mobil',
    'Tasarım',
    'Test',
    'Proje Yönetimi'
  ]);
  const [newDepartment, setNewDepartment] = useState('');
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editingValue, setEditingValue] = useState('');

  const handleAddDepartment = () => {
    if (newDepartment.trim() && !departments.includes(newDepartment.trim())) {
      setDepartments([...departments, newDepartment.trim()]);
      setNewDepartment('');
      toast.success('Departman eklendi');
    } else {
      toast.error('Geçersiz veya zaten mevcut departman');
    }
  };

  const handleDeleteDepartment = (index: number) => {
    if (departments.length > 1) {
      const newDepartments = departments.filter((_, i) => i !== index);
      setDepartments(newDepartments);
      toast.success('Departman silindi');
    } else {
      toast.error('En az bir departman olmalı');
    }
  };

  const handleEditDepartment = (index: number) => {
    setEditingIndex(index);
    setEditingValue(departments[index]);
  };

  const handleSaveEdit = () => {
    if (editingValue.trim() && !departments.includes(editingValue.trim())) {
      const newDepartments = [...departments];
      newDepartments[editingIndex] = editingValue.trim();
      setDepartments(newDepartments);
      setEditingIndex(-1);
      setEditingValue('');
      toast.success('Departman güncellendi');
    } else {
      toast.error('Geçersiz veya zaten mevcut departman');
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(-1);
    setEditingValue('');
  };

  const handleSaveSettings = async () => {
    try {
      const response = await api.put('/settings', {
        language,
        departments
      });
      
      if (response.data.success) {
        // Ayarları localStorage'a da kaydet
        localStorage.setItem('appSettings', JSON.stringify({
          language,
          departments
        }));
        toast.success('Ayarlar kaydedildi');
      }
    } catch (error: any) {
      toast.error('Ayarlar kaydedilemedi');
      console.error('Settings save error:', error);
    }
  };

  useEffect(() => {
    // Ayarları yükle
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setLanguage(settings.language || 'tr');
      setDepartments(settings.departments || departments);
    }
  }, []);

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Sistem Ayarları</h1>
          <p className="text-gray-400">Uygulama ayarlarını yönetin</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dil Ayarları */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Globe className="w-5 h-5 text-accent mr-2" />
              <h2 className="text-xl font-semibold">Dil Ayarları</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Uygulama Dili
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                >
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>

          {/* Departman Yönetimi */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Building className="w-5 h-5 text-highlight mr-2" />
              <h2 className="text-xl font-semibold">Departman Yönetimi</h2>
            </div>
            
            <div className="space-y-4">
              {/* Yeni Departman Ekleme */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  placeholder="Yeni departman adı"
                  className="flex-1 px-4 py-2 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddDepartment()}
                />
                <button
                  onClick={handleAddDepartment}
                  className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-xl transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Departman Listesi */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {departments.map((dept, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-dark-bg border border-dark-border rounded-lg p-3"
                  >
                    {editingIndex === index ? (
                      <div className="flex-1 flex space-x-2">
                        <input
                          type="text"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          className="flex-1 px-2 py-1 bg-dark-card border border-dark-border rounded focus:outline-none focus:border-accent"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          autoFocus
                        />
                        <button
                          onClick={handleSaveEdit}
                          className="text-green-400 hover:text-green-300 p-1"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-gray-400 hover:text-gray-300 p-1"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="flex-1 text-sm">{dept}</span>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleEditDepartment(index)}
                            className="text-blue-400 hover:text-blue-300 p-1"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDepartment(index)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Ekip Bilgileri */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <div className="flex items-center mb-6">
            <Users className="w-5 h-5 text-green-400 mr-2" />
            <h2 className="text-xl font-semibold">Mevcut Ekip Yapısı</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Yönetim */}
            <div className="space-y-3">
              <h3 className="font-semibold text-accent border-b border-accent/20 pb-2">👑 Yönetim</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center text-accent font-semibold text-xs">
                    BG
                  </div>
                  <div>
                    <div className="font-medium">Burak Gökçe</div>
                    <div className="text-gray-400 text-xs">Founder / CEO</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-highlight/20 rounded-full flex items-center justify-center text-highlight font-semibold text-xs">
                    EY
                  </div>
                  <div>
                    <div className="font-medium">Erenalp Yılmaz</div>
                    <div className="text-gray-400 text-xs">COO / Project Manager</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Yazılım Ekibi */}
            <div className="space-y-3">
              <h3 className="font-semibold text-blue-400 border-b border-blue-400/20 pb-2">🧠 Yazılım Ekibi</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-400/20 rounded-full flex items-center justify-center text-blue-400 font-semibold text-xs">
                    MA
                  </div>
                  <div>
                    <div className="font-medium">Merve Arslan</div>
                    <div className="text-gray-400 text-xs">Backend Developer</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-400/20 rounded-full flex items-center justify-center text-green-400 font-semibold text-xs">
                    MN
                  </div>
                  <div>
                    <div className="font-medium">Mustafa Nalbant</div>
                    <div className="text-gray-400 text-xs">Frontend Developer (Web)</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-400/20 rounded-full flex items-center justify-center text-green-400 font-semibold text-xs">
                    S
                  </div>
                  <div>
                    <div className="font-medium">Sinan</div>
                    <div className="text-gray-400 text-xs">Frontend Developer (Web)</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-purple-400/20 rounded-full flex items-center justify-center text-purple-400 font-semibold text-xs">
                    BY
                  </div>
                  <div>
                    <div className="font-medium">Bayram Yeleç</div>
                    <div className="text-gray-400 text-xs">iOS Developer</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-purple-400/20 rounded-full flex items-center justify-center text-purple-400 font-semibold text-xs">
                    OK
                  </div>
                  <div>
                    <div className="font-medium">Oğuzhan Katlanoğlu</div>
                    <div className="text-gray-400 text-xs">iOS Developer</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-yellow-400/20 rounded-full flex items-center justify-center text-yellow-400 font-semibold text-xs">
                    E
                  </div>
                  <div>
                    <div className="font-medium">Ebru</div>
                    <div className="text-gray-400 text-xs">Web Developer (Stajyer)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tasarım & Test */}
            <div className="space-y-3">
              <h3 className="font-semibold text-pink-400 border-b border-pink-400/20 pb-2">🎨 Tasarım & Test</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-pink-400/20 rounded-full flex items-center justify-center text-pink-400 font-semibold text-xs">
                    MSÜ
                  </div>
                  <div>
                    <div className="font-medium">Merve Sude Üder</div>
                    <div className="text-gray-400 text-xs">UI/UX Designer</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-orange-400/20 rounded-full flex items-center justify-center text-orange-400 font-semibold text-xs">
                    FA
                  </div>
                  <div>
                    <div className="font-medium">Fatmanur Akçabet</div>
                    <div className="text-gray-400 text-xs">Tester (Stajyer)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kaydet Butonu */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveSettings}
            className="bg-accent hover:bg-accent/90 text-white px-6 py-3 rounded-xl transition-colors flex items-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>Ayarları Kaydet</span>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

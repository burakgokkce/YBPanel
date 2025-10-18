'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  BarChart3, 
  Users, 
  CheckSquare, 
  Calendar,
  TrendingUp,
  Download,
  Filter,
  Calendar as CalendarIcon
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ReportsPage() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalMeetings: 0,
    totalAnnouncements: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      toast.error('Raporlar yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const exportReportPDF = async () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Header
      pdf.setFontSize(20);
      pdf.text('YB Digital Panel - Sistem Raporu', pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, pageWidth / 2, 30, { align: 'center' });
      
      // Stats
      let yPosition = 50;
      pdf.setFontSize(16);
      pdf.text('Sistem İstatistikleri', 20, yPosition);
      
      yPosition += 15;
      pdf.setFontSize(12);
      
      const statsData = [
        ['Toplam Üye Sayısı', stats.totalMembers.toString()],
        ['Aktif Üye Sayısı', stats.activeMembers.toString()],
        ['Toplam Görev Sayısı', stats.totalTasks.toString()],
        ['Tamamlanan Görevler', stats.completedTasks.toString()],
        ['Bekleyen Görevler', stats.pendingTasks.toString()],
        ['Toplam Toplantı Sayısı', stats.totalMeetings.toString()],
        ['Toplam Duyuru Sayısı', stats.totalAnnouncements.toString()]
      ];
      
      statsData.forEach(([label, value]) => {
        pdf.text(`${label}: ${value}`, 20, yPosition);
        yPosition += 10;
      });
      
      // Performance metrics
      yPosition += 10;
      pdf.setFontSize(16);
      pdf.text('Performans Metrikleri', 20, yPosition);
      
      yPosition += 15;
      pdf.setFontSize(12);
      
      const completionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;
      const activeRate = stats.totalMembers > 0 ? Math.round((stats.activeMembers / stats.totalMembers) * 100) : 0;
      
      pdf.text(`Görev Tamamlanma Oranı: %${completionRate}`, 20, yPosition);
      yPosition += 10;
      pdf.text(`Aktif Üye Oranı: %${activeRate}`, 20, yPosition);
      
      // Footer
      pdf.setFontSize(10);
      pdf.text('YB Digital Panel - Otomatik Rapor', pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      // Save PDF
      const fileName = `YB_Digital_Rapor_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast.success('PDF raporu indirildi');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('PDF raporu oluşturulamadı');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout requiredRole="project_manager">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-dark-card rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-dark-card rounded-xl"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="project_manager">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Raporlar</h1>
            <p className="text-gray-400">Sistem istatistikleri ve performans raporları</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 bg-dark-card border border-dark-border rounded-xl focus:outline-none focus:border-accent"
            >
              <option value="7">Son 7 Gün</option>
              <option value="30">Son 30 Gün</option>
              <option value="90">Son 3 Ay</option>
              <option value="365">Son 1 Yıl</option>
            </select>
            
            <button
              onClick={exportReportPDF}
              className="flex items-center space-x-2 bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-xl transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>PDF Rapor İndir</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Toplam Üye</p>
                <p className="text-2xl font-bold">{stats.totalMembers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Aktif Üye</p>
                <p className="text-2xl font-bold text-green-400">{stats.activeMembers}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Toplam Görev</p>
                <p className="text-2xl font-bold">{stats.totalTasks}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <CheckSquare className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Tamamlanan</p>
                <p className="text-2xl font-bold text-accent">{stats.completedTasks}</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-accent" />
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Görev İstatistikleri</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Bekleyen Görevler</span>
                <span className="font-semibold">{stats.pendingTasks}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Tamamlanan Görevler</span>
                <span className="font-semibold text-green-400">{stats.completedTasks}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Tamamlanma Oranı</span>
                <span className="font-semibold text-accent">
                  {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Sistem İstatistikleri</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Toplam Duyuru</span>
                <span className="font-semibold">{stats.totalAnnouncements}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Toplam Toplantı</span>
                <span className="font-semibold">{stats.totalMeetings}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Aktif Üye Oranı</span>
                <span className="font-semibold text-green-400">
                  {stats.totalMembers > 0 ? Math.round((stats.activeMembers / stats.totalMembers) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Export Info */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <CalendarIcon className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-semibold">Rapor Bilgileri</h3>
          </div>
          <div className="text-gray-400 space-y-2">
            <p>• Raporlar gerçek zamanlı veriler üzerinden oluşturulur</p>
            <p>• İndirilen raporlar JSON formatında kaydedilir</p>
            <p>• Tarih aralığı seçerek farklı dönemleri analiz edebilirsiniz</p>
            <p>• Son güncelleme: {new Date().toLocaleString('tr-TR')}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

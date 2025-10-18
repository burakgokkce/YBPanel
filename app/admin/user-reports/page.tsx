'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  FileText, 
  Filter, 
  Search, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle,
  User,
  Calendar,
  Download,
  MessageSquare
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';
import jsPDF from 'jspdf';

interface UserReport {
  _id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  author: {
    firstName: string;
    lastName: string;
    email: string;
    department: string;
  };
  authorName: string;
  authorRole: string;
  department: string;
  status: string;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}

export default function UserReportsPage() {
  const [reports, setReports] = useState<UserReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<UserReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, selectedStatus, selectedCategory, selectedPriority]);

  const fetchReports = async () => {
    try {
      const response = await api.get('/user-reports');
      if (response.data.success) {
        setReports(response.data.data);
      }
    } catch (error: any) {
      toast.error('Raporlar yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = reports;

    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.authorName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(report => report.status === selectedStatus);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(report => report.category === selectedCategory);
    }

    if (selectedPriority !== 'all') {
      filtered = filtered.filter(report => report.priority === selectedPriority);
    }

    setFilteredReports(filtered);
  };

  const updateReportStatus = async (reportId: string, status: string, notes: string = '') => {
    try {
      const response = await api.put(`/user-reports/${reportId}`, {
        status,
        adminNotes: notes
      });

      if (response.data.success) {
        toast.success('Rapor durumu güncellendi');
        fetchReports();
        setShowDetailModal(false);
      }
    } catch (error: any) {
      toast.error('Durum güncellenemedi');
    }
  };

  const exportReportPDF = async (report: UserReport) => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      // Header
      pdf.setFontSize(18);
      pdf.text('Kullanıcı Raporu', pageWidth / 2, 20, { align: 'center' });
      
      // Report details
      let yPosition = 40;
      pdf.setFontSize(12);
      
      pdf.text(`Başlık: ${report.title}`, 20, yPosition);
      yPosition += 10;
      pdf.text(`Yazar: ${report.authorName} (${report.authorRole})`, 20, yPosition);
      yPosition += 10;
      pdf.text(`Departman: ${report.department || 'Belirtilmemiş'}`, 20, yPosition);
      yPosition += 10;
      pdf.text(`Kategori: ${report.category}`, 20, yPosition);
      yPosition += 10;
      pdf.text(`Öncelik: ${report.priority}`, 20, yPosition);
      yPosition += 10;
      pdf.text(`Durum: ${report.status}`, 20, yPosition);
      yPosition += 10;
      pdf.text(`Tarih: ${formatDate(report.createdAt)}`, 20, yPosition);
      
      yPosition += 20;
      pdf.setFontSize(14);
      pdf.text('İçerik:', 20, yPosition);
      
      yPosition += 10;
      pdf.setFontSize(10);
      const splitContent = pdf.splitTextToSize(report.content, pageWidth - 40);
      pdf.text(splitContent, 20, yPosition);
      
      if (report.adminNotes) {
        yPosition += splitContent.length * 5 + 20;
        pdf.setFontSize(14);
        pdf.text('Admin Notları:', 20, yPosition);
        yPosition += 10;
        pdf.setFontSize(10);
        const splitNotes = pdf.splitTextToSize(report.adminNotes, pageWidth - 40);
        pdf.text(splitNotes, 20, yPosition);
      }
      
      // Save PDF
      const fileName = `Rapor_${report.authorName}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast.success('PDF raporu indirildi');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('PDF raporu oluşturulamadı');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'beklemede': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'inceleniyor': return <Eye className="w-4 h-4 text-blue-400" />;
      case 'tamamlandı': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'reddedildi': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'düşük': return 'text-green-400';
      case 'orta': return 'text-yellow-400';
      case 'yüksek': return 'text-orange-400';
      case 'kritik': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const openDetailModal = (report: UserReport) => {
    setSelectedReport(report);
    setAdminNotes(report.adminNotes || '');
    setShowDetailModal(true);
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
            <h1 className="text-3xl font-bold mb-2">Kullanıcı Raporları</h1>
            <p className="text-gray-400">Ekip üyelerinden gelen raporları inceleyin ve yönetin</p>
          </div>
          
          <div className="text-sm text-gray-400">
            Toplam {filteredReports.length} rapor
          </div>
        </div>

        {/* Filters */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="beklemede">Beklemede</option>
              <option value="inceleniyor">İnceleniyor</option>
              <option value="tamamlandı">Tamamlandı</option>
              <option value="reddedildi">Reddedildi</option>
            </select>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
            >
              <option value="all">Tüm Kategoriler</option>
              <option value="günlük">Günlük</option>
              <option value="haftalık">Haftalık</option>
              <option value="aylık">Aylık</option>
              <option value="proje">Proje</option>
              <option value="sorun">Sorun</option>
              <option value="öneri">Öneri</option>
              <option value="diğer">Diğer</option>
            </select>
            
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-4 py-2 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
            >
              <option value="all">Tüm Öncelikler</option>
              <option value="düşük">Düşük</option>
              <option value="orta">Orta</option>
              <option value="yüksek">Yüksek</option>
              <option value="kritik">Kritik</option>
            </select>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.map(report => (
            <div key={report._id} className="bg-dark-card border border-dark-border rounded-xl p-6 hover:border-accent/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">{report.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(report.priority)}`}>
                      {report.priority}
                    </span>
                    <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full">
                      {report.category}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{report.authorName} ({report.authorRole})</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(report.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(report.status)}
                      <span>{report.status}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 line-clamp-2">
                    {report.content.substring(0, 200)}...
                  </p>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => openDetailModal(report)}
                    className="p-2 text-gray-400 hover:text-accent transition-colors"
                    title="Detayları Görüntüle"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => exportReportPDF(report)}
                    className="p-2 text-gray-400 hover:text-green-400 transition-colors"
                    title="PDF İndir"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <h3 className="text-lg font-semibold mb-2">Rapor bulunamadı</h3>
            <p className="text-gray-400">Arama kriterlerinize uygun rapor bulunmuyor</p>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-card border border-dark-border rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Rapor Detayları</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Report Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Başlık</label>
                    <p className="text-gray-300">{selectedReport.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Yazar</label>
                    <p className="text-gray-300">{selectedReport.authorName} ({selectedReport.authorRole})</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Kategori</label>
                    <p className="text-gray-300">{selectedReport.category}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Öncelik</label>
                    <p className={getPriorityColor(selectedReport.priority)}>{selectedReport.priority}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Durum</label>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(selectedReport.status)}
                      <span>{selectedReport.status}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tarih</label>
                    <p className="text-gray-300">{formatDate(selectedReport.createdAt)}</p>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium mb-2">İçerik</label>
                  <div className="bg-dark-bg p-4 rounded-xl">
                    <pre className="whitespace-pre-wrap text-gray-300">{selectedReport.content}</pre>
                  </div>
                </div>

                {/* Admin Notes */}
                <div>
                  <label className="block text-sm font-medium mb-2">Admin Notları</label>
                  <textarea
                    rows={4}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors resize-none"
                    placeholder="Admin notlarınızı yazın..."
                  />
                </div>

                {/* Status Update */}
                <div className="flex items-center justify-between pt-4 border-t border-dark-border">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateReportStatus(selectedReport._id, 'inceleniyor', adminNotes)}
                      className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-colors"
                    >
                      İnceleniyor
                    </button>
                    <button
                      onClick={() => updateReportStatus(selectedReport._id, 'tamamlandı', adminNotes)}
                      className="px-4 py-2 bg-green-500/20 text-green-400 rounded-xl hover:bg-green-500/30 transition-colors"
                    >
                      Tamamlandı
                    </button>
                    <button
                      onClick={() => updateReportStatus(selectedReport._id, 'reddedildi', adminNotes)}
                      className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors"
                    >
                      Reddedildi
                    </button>
                  </div>
                  
                  <button
                    onClick={() => exportReportPDF(selectedReport)}
                    className="flex items-center space-x-2 bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-xl transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>PDF İndir</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

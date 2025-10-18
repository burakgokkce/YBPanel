'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  FileText, 
  Send, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Star,
  BookOpen,
  Lightbulb
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function WriteReportPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'günlük',
    priority: 'orta'
  });

  const categories = [
    { value: 'günlük', label: 'Günlük Rapor', icon: Clock },
    { value: 'haftalık', label: 'Haftalık Rapor', icon: CheckCircle },
    { value: 'aylık', label: 'Aylık Rapor', icon: Star },
    { value: 'proje', label: 'Proje Raporu', icon: FileText },
    { value: 'sorun', label: 'Sorun Bildirimi', icon: AlertCircle },
    { value: 'öneri', label: 'Öneri', icon: Lightbulb },
    { value: 'diğer', label: 'Diğer', icon: BookOpen }
  ];

  const priorities = [
    { value: 'düşük', label: 'Düşük', color: 'text-green-400' },
    { value: 'orta', label: 'Orta', color: 'text-yellow-400' },
    { value: 'yüksek', label: 'Yüksek', color: 'text-orange-400' },
    { value: 'kritik', label: 'Kritik', color: 'text-red-400' }
  ];

  const exampleReports = {
    günlük: {
      title: "Günlük Çalışma Raporu - 18.10.2025",
      content: `Bugün tamamladığım işler:
• Kullanıcı arayüzü tasarımı revize edildi
• API entegrasyonu test edildi
• 3 adet bug düzeltildi

Karşılaştığım sorunlar:
• Database bağlantı sorunu (çözüldü)
• CSS responsive sorunu (devam ediyor)

Yarın planladığım işler:
• Responsive tasarım düzeltmeleri
• Yeni özellik geliştirme
• Test senaryoları yazma`
    },
    proje: {
      title: "YB Digital Panel Proje Durumu",
      content: `Proje Adı: YB Digital Panel
Durum: %85 Tamamlandı

Tamamlanan Modüller:
• Kullanıcı yönetimi ✓
• Görev takip sistemi ✓
• Duyuru sistemi ✓
• E-posta entegrasyonu ✓

Devam Eden Çalışmalar:
• Rapor sistemi (bu hafta tamamlanacak)
• Mobil uyumluluk iyileştirmeleri

Riskler ve Öneriler:
• Test süreci için ek zaman gerekebilir
• Performans optimizasyonu yapılmalı`
    },
    sorun: {
      title: "Sistem Performans Sorunu",
      content: `Sorun Tanımı:
Sistem yoğun kullanım saatlerinde yavaşlama yaşanıyor.

Etkilenen Alanlar:
• Kullanıcı girişi (5-10 saniye gecikme)
• Rapor yükleme (15+ saniye)
• Dosya yükleme işlemleri

Önerilen Çözümler:
• Database indexleme optimizasyonu
• Cache sistemi implementasyonu
• Server kapasitesi artırımı

Aciliyet: Yüksek - Kullanıcı deneyimini olumsuz etkiliyor`
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Başlık ve içerik zorunludur');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post('/user-reports', formData);
      
      if (response.data.success) {
        toast.success('Rapor başarıyla gönderildi!');
        router.push('/member/reports');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Rapor gönderilemedi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadExample = (category: string) => {
    const example = exampleReports[category as keyof typeof exampleReports];
    if (example) {
      setFormData({
        ...formData,
        title: example.title,
        content: example.content,
        category
      });
      toast.success('Örnek rapor yüklendi');
    }
  };

  return (
    <DashboardLayout requiredRole="project_manager">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Proje Yöneticisi Raporu</h1>
          <p className="text-gray-400">Proje durumlarınızı, ekip performansını ve yönetim raporlarınızı yazın</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-dark-card border border-dark-border rounded-xl p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Rapor Başlığı</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  placeholder="Rapor başlığını girin..."
                  required
                />
              </div>

              {/* Category and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Öncelik</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  >
                    {priorities.map(priority => (
                      <option key={priority.value} value={priority.value}>{priority.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium mb-2">Rapor İçeriği</label>
                <textarea
                  rows={12}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors resize-none"
                  placeholder="Rapor içeriğinizi detaylı olarak yazın..."
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-accent hover:bg-accent/90 text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Gönderiliyor...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Raporu Gönder</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Example Reports */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-accent" />
                Örnek Raporlar
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => loadExample('günlük')}
                  className="w-full text-left p-3 bg-dark-bg rounded-lg hover:bg-dark-border transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-sm">Günlük Rapor Örneği</span>
                  </div>
                </button>
                
                <button
                  onClick={() => loadExample('proje')}
                  className="w-full text-left p-3 bg-dark-bg rounded-lg hover:bg-dark-border transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-green-400" />
                    <span className="text-sm">Proje Raporu Örneği</span>
                  </div>
                </button>
                
                <button
                  onClick={() => loadExample('sorun')}
                  className="w-full text-left p-3 bg-dark-bg rounded-lg hover:bg-dark-border transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-sm">Sorun Bildirimi Örneği</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
                Rapor Yazma İpuçları
              </h3>
              
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                  <span>Başlığı açık ve öz tutun</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                  <span>Madde işaretleri kullanarak düzenli yazın</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                  <span>Sorunları ve çözümleri belirtin</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                  <span>Gelecek planlarınızı ekleyin</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                  <span>Doğru kategori ve öncelik seçin</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

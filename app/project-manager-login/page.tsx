'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProjectManagerLogin() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = () => {
    if (!password) {
      toast.error('Lütfen şifrenizi girin');
      return;
    }
    
    setIsLoading(true);

    // Proje yöneticisi şifre kontrolü
    if (password === '150924') {
      // Proje yöneticisi bilgilerini localStorage'a kaydet
      const projectManagerUser = {
        _id: 'pm-001',
        name: 'Proje Yöneticisi',
        firstName: 'Proje',
        lastName: 'Yöneticisi',
        email: 'project-manager@ybdigital.com',
        role: 'project_manager',
        department: 'Proje Yönetimi',
        position: 'Proje Yöneticisi',
        isActive: true
      };

      localStorage.setItem('user', JSON.stringify(projectManagerUser));
      localStorage.setItem('token', 'pm-token-' + Date.now());
      
      toast.success('Giriş başarılı!');
      
      // Yönlendirme
      setTimeout(() => {
        router.push('/admin');
        setIsLoading(false);
      }, 1000);
    } else {
      toast.error('Şifre hatalı!');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-accent to-highlight rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Proje Yöneticisi Girişi</h1>
          <p className="text-gray-400">Proje yönetimi paneline erişim</p>
        </div>

        {/* Login Form */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-8">
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  placeholder="Şifrenizi girin"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-accent to-highlight text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

        </div>

        {/* Back to Main Login */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/login')}
            className="text-gray-400 hover:text-accent transition-colors text-sm"
          >
            ← Ana Giriş Sayfasına Dön
          </button>
        </div>
      </div>
    </div>
  );
}

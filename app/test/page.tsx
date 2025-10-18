'use client';

import { useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function TestPage() {
  const [loginData, setLoginData] = useState({
    email: 'ahmet@test.com',
    password: '123456'
  });
  
  const [registerData, setRegisterData] = useState({
    firstName: 'Test',
    lastName: 'User',
    email: 'test' + Date.now() + '@test.com',
    password: '123456'
  });

  const testLogin = async () => {
    try {
      console.log('Testing login with:', loginData);
      const response = await api.post('/auth/member-login', loginData);
      console.log('Login response:', response.data);
      toast.success('Giriş başarılı!');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Giriş hatası: ' + (error.response?.data?.message || error.message));
    }
  };

  const testRegister = async () => {
    try {
      console.log('Testing register with:', registerData);
      const response = await api.post('/auth/register', registerData);
      console.log('Register response:', response.data);
      toast.success('Kayıt başarılı!');
    } catch (error: any) {
      console.error('Register error:', error);
      toast.error('Kayıt hatası: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-white">API Test Sayfası</h1>
        
        {/* Login Test */}
        <div className="bg-dark-card p-6 rounded-xl border border-dark-border">
          <h2 className="text-xl font-semibold text-white mb-4">Giriş Testi</h2>
          <div className="space-y-4">
            <input
              type="email"
              placeholder="E-posta"
              value={loginData.email}
              onChange={(e) => setLoginData({...loginData, email: e.target.value})}
              className="w-full p-3 bg-dark-bg border border-dark-border rounded-xl text-white"
            />
            <input
              type="password"
              placeholder="Şifre"
              value={loginData.password}
              onChange={(e) => setLoginData({...loginData, password: e.target.value})}
              className="w-full p-3 bg-dark-bg border border-dark-border rounded-xl text-white"
            />
            <button
              onClick={testLogin}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-xl"
            >
              Giriş Testi Yap
            </button>
          </div>
        </div>

        {/* Register Test */}
        <div className="bg-dark-card p-6 rounded-xl border border-dark-border">
          <h2 className="text-xl font-semibold text-white mb-4">Kayıt Testi</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Ad"
              value={registerData.firstName}
              onChange={(e) => setRegisterData({...registerData, firstName: e.target.value})}
              className="w-full p-3 bg-dark-bg border border-dark-border rounded-xl text-white"
            />
            <input
              type="text"
              placeholder="Soyad"
              value={registerData.lastName}
              onChange={(e) => setRegisterData({...registerData, lastName: e.target.value})}
              className="w-full p-3 bg-dark-bg border border-dark-border rounded-xl text-white"
            />
            <input
              type="email"
              placeholder="E-posta"
              value={registerData.email}
              onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
              className="w-full p-3 bg-dark-bg border border-dark-border rounded-xl text-white"
            />
            <input
              type="password"
              placeholder="Şifre"
              value={registerData.password}
              onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
              className="w-full p-3 bg-dark-bg border border-dark-border rounded-xl text-white"
            />
            <button
              onClick={testRegister}
              className="w-full bg-green-500 hover:bg-green-600 text-white p-3 rounded-xl"
            >
              Kayıt Testi Yap
            </button>
          </div>
        </div>

        {/* API Info */}
        <div className="bg-dark-card p-6 rounded-xl border border-dark-border">
          <h2 className="text-xl font-semibold text-white mb-4">API Bilgileri</h2>
          <div className="text-gray-300 space-y-2">
            <p><strong>Backend URL:</strong> http://localhost:5002</p>
            <p><strong>Login Endpoint:</strong> /api/auth/member-login</p>
            <p><strong>Register Endpoint:</strong> /api/auth/register</p>
            <p><strong>Test User:</strong> ahmet@test.com / 123456</p>
          </div>
        </div>
      </div>
    </div>
  );
}

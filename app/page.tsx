import Link from 'next/link'
import { Shield, Users, LogIn } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg to-dark-card flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center">
          {/* YB Digital Logo */}
          <div className="w-24 h-24 mx-auto mb-6">
            <img 
              src="/yb-digital-logo.svg" 
              alt="YB Digital" 
              className="w-full h-full"
            />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-accent to-highlight bg-clip-text text-transparent">
            YB Digital Panel
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Takım işbirliği, görev yönetimi ve organizasyonel verimlilik için dahili yönetim sistemi.
          </p>
        
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Admin Login */}
            <Link href="/login" className="group">
              <div className="bg-dark-card border border-dark-border rounded-2xl p-8 hover:border-accent transition-all duration-300 hover:shadow-lg hover:shadow-accent/20">
                <div className="w-16 h-16 bg-accent/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/30 transition-colors">
                  <Shield className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Yönetici Girişi</h3>
                <p className="text-gray-400">
                  Tam yönetim yetkilerine sahip yönetici paneline erişin
                </p>
              </div>
            </Link>

            {/* Member Login */}
            <Link href="/member-login" className="group">
              <div className="bg-dark-card border border-dark-border rounded-2xl p-8 hover:border-highlight transition-all duration-300 hover:shadow-lg hover:shadow-highlight/20">
                <div className="w-16 h-16 bg-highlight/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-highlight/30 transition-colors">
                  <LogIn className="w-8 h-8 text-highlight" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Üye Girişi</h3>
                <p className="text-gray-400">
                  Kişisel panonuza erişin ve görevlerinizi yönetin
                </p>
              </div>
            </Link>

            {/* Member Registration */}
            <Link href="/register" className="group">
              <div className="bg-dark-card border border-dark-border rounded-2xl p-8 hover:border-green-400 transition-all duration-300 hover:shadow-lg hover:shadow-green-400/20">
                <div className="w-16 h-16 bg-green-400/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-400/30 transition-colors">
                  <Users className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Takıma Katıl</h3>
                <p className="text-gray-400">
                  Yeni takım üyesi olarak kaydolun ve işbirliğine başlayın
                </p>
              </div>
            </Link>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-500 text-sm">
              © 2024 YB Digital. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

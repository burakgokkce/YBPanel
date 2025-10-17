import Link from 'next/link'
import { Shield, Users, LogIn } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg to-dark-card flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-accent to-highlight bg-clip-text text-transparent">
            YB Digital Panel
          </h1>
          <p className="text-xl text-gray-300">
            Internal Management System
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Admin Login */}
          <Link href="/login" className="group">
            <div className="bg-dark-card border border-dark-border rounded-2xl p-8 hover:border-accent transition-all duration-300 hover:shadow-lg hover:shadow-accent/20">
              <div className="flex flex-col items-center text-center">
                <div className="bg-accent/20 p-4 rounded-full mb-4 group-hover:bg-accent/30 transition-colors">
                  <Shield className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Admin Login</h3>
                <p className="text-gray-400 text-sm">
                  Access admin dashboard with master password
                </p>
              </div>
            </div>
          </Link>

          {/* Member Login */}
          <Link href="/member-login" className="group">
            <div className="bg-dark-card border border-dark-border rounded-2xl p-8 hover:border-highlight transition-all duration-300 hover:shadow-lg hover:shadow-highlight/20">
              <div className="flex flex-col items-center text-center">
                <div className="bg-highlight/20 p-4 rounded-full mb-4 group-hover:bg-highlight/30 transition-colors">
                  <LogIn className="w-8 h-8 text-highlight" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Member Login</h3>
                <p className="text-gray-400 text-sm">
                  Sign in to your member account
                </p>
              </div>
            </div>
          </Link>

          {/* Member Registration */}
          <Link href="/register" className="group">
            <div className="bg-dark-card border border-dark-border rounded-2xl p-8 hover:border-green-500 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20">
              <div className="flex flex-col items-center text-center">
                <div className="bg-green-500/20 p-4 rounded-full mb-4 group-hover:bg-green-500/30 transition-colors">
                  <Users className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Join Team</h3>
                <p className="text-gray-400 text-sm">
                  Register as a new team member
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            © 2024 YB Digital. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

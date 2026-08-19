'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
    if (!loading && user && !user.isSuperAdmin) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  if (!user || !user.isSuperAdmin) return null

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-gray-800 text-white w-64 flex-shrink-0 transition-all duration-300 ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="p-4 text-xl font-bold">aarStock Admin</div>
        <nav className="mt-8">
          <Link href="/admin" className="block py-2 px-4 hover:bg-gray-700">Dashboard</Link>
          <Link href="/admin/companies" className="block py-2 px-4 hover:bg-gray-700">Companies</Link>
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-700">
          <div className="text-sm">{user.username}</div>
          <button onClick={signOut} className="text-sm text-red-400 hover:text-red-300">Sign Out</button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 bg-white shadow flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-600 hover:text-gray-800">
            ☰
          </button>
          <span className="font-semibold">Super Admin</span>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
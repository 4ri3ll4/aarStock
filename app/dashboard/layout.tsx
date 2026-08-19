'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
    if (!loading && user && user.isSuperAdmin) {
      router.push('/admin')
    }
  }, [user, loading, router])

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  if (!user) return null

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-white text-gray-800 w-64 flex-shrink-0 shadow-md transition-all duration-300 ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="p-4 text-xl font-bold border-b">{user.companyName || 'aarStock'}</div>
        <nav className="mt-8">
          <Link href="/dashboard" className="block py-2 px-4 hover:bg-gray-100">Dashboard</Link>
          <Link href="/dashboard/locations" className="block py-2 px-4 hover:bg-gray-100">Locations</Link>
          <Link href="/dashboard/products" className="block py-2 px-4 hover:bg-gray-100">Products</Link>
          <Link href="/dashboard/orders" className="block py-2 px-4 hover:bg-gray-100">Orders</Link>
          <Link href="/dashboard/reports" className="block py-2 px-4 hover:bg-gray-100">Reports</Link>
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
          <div className="text-sm font-medium">{user.username}</div>
          <button onClick={signOut} className="text-sm text-red-500 hover:text-red-700">Sign Out</button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 bg-white shadow flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-600 hover:text-gray-800">
            ☰
          </button>
          <span className="font-semibold">{user.companyName || 'Dashboard'}</span>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
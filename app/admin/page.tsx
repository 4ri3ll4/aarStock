'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    companies: 0,
    users: 0,
    locations: 0,
    products: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      const [companies, users, locations, products] = await Promise.all([
        supabase.from('companies').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('locations').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
      ])
      setStats({
        companies: companies.count || 0,
        users: users.count || 0,
        locations: locations.count || 0,
        products: products.count || 0,
      })
    }
    fetchStats()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Companies', value: stats.companies },
          { label: 'Users', value: stats.users },
          { label: 'Locations', value: stats.locations },
          { label: 'Products', value: stats.products },
        ].map((item) => (
          <div key={item.label} className="bg-white p-6 rounded shadow">
            <h3 className="text-sm text-gray-500">{item.label}</h3>
            <p className="text-3xl font-bold">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
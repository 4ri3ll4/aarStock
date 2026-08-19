'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    locations: 0,
    products: 0,
    ordersToday: 0,
    lowStock: 0,
  })

  useEffect(() => {
    if (!user) return

    const fetchStats = async () => {
      // Locations
      const { count: locationCount } = await supabase
        .from('locations')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', user.companyId)

      // Products
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', user.companyId)

      // Orders today (if you have orders table)
      const today = new Date().toISOString().split('T')[0]
      const { count: ordersToday } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', user.companyId)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)

      // Low stock – first get location IDs for this company
      const { data: locationIds } = await supabase
        .from('locations')
        .select('id')
        .eq('company_id', user.companyId)

      let lowStockCount = 0
      if (locationIds && locationIds.length > 0) {
        const ids = locationIds.map(l => l.id)
        const { count } = await supabase
          .from('location_stock')
          .select('*', { count: 'exact', head: true })
          .in('location_id', ids)
          .lt('quantity', 5)
        lowStockCount = count || 0
      }

      setStats({
        locations: locationCount || 0,
        products: productCount || 0,
        ordersToday: ordersToday || 0,
        lowStock: lowStockCount,
      })
    }

    fetchStats()
  }, [user])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Locations', value: stats.locations },
          { label: 'Products', value: stats.products },
          { label: 'Orders Today', value: stats.ordersToday },
          { label: 'Low Stock Items', value: stats.lowStock },
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
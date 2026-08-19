'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function CompanyDetailPage() {
  const { id } = useParams()
  const [company, setCompany] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCompanyData = async () => {
    const { data: companyData } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single()

    const { data: usersData } = await supabase
      .from('users')
      .select('*')
      .eq('company_id', id)

    const { data: locationsData } = await supabase
      .from('locations')
      .select('*')
      .eq('company_id', id)

    setCompany(companyData)
    setUsers(usersData || [])
    setLocations(locationsData || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchCompanyData()
  }, [id])

  if (loading) return <div>Loading...</div>
  if (!company) return <div>Company not found</div>

  return (
    <div>
      <h1 className="text-2xl font-bold">{company.name}</h1>
      <p className="text-gray-500">Subdomain: {company.subdomain}</p>
      <p className="text-sm text-gray-400">ID: {company.id}</p>

      <div className="mt-8 grid grid-cols-2 gap-6">
        {/* Users */}
        <div className="bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Users</h2>
            <button className="text-blue-600 text-sm hover:underline">+ Add User</button>
          </div>
          <ul className="divide-y divide-gray-200">
            {users.map((user) => (
              <li key={user.id} className="py-2 flex justify-between items-center">
                <span>{user.username}</span>
                <span className="text-sm text-gray-500">{user.role}</span>
              </li>
            ))}
            {users.length === 0 && <li className="py-2 text-gray-400">No users yet</li>}
          </ul>
        </div>

        {/* Locations */}
        <div className="bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Locations</h2>
            <button className="text-blue-600 text-sm hover:underline">+ Add Location</button>
          </div>
          <ul className="divide-y divide-gray-200">
            {locations.map((loc) => (
              <li key={loc.id} className="py-2 flex justify-between items-center">
                <span>{loc.name}</span>
                <span className="text-sm text-gray-500">{loc.type}</span>
              </li>
            ))}
            {locations.length === 0 && <li className="py-2 text-gray-400">No locations yet</li>}
          </ul>
        </div>
      </div>
    </div>
  )
}
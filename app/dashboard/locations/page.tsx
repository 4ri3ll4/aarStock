'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function LocationsPage() {
  const { user } = useAuth()
  const [locations, setLocations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newLocation, setNewLocation] = useState({ name: '', type: 'store' })

  const fetchLocations = async () => {
    if (!user) return
    const { data } = await supabase
      .from('locations')
      .select('*')
      .eq('company_id', user.companyId)
      .order('created_at', { ascending: true })
    setLocations(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchLocations()
  }, [user])

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    const { error } = await supabase
      .from('locations')
      .insert({
        company_id: user.companyId,
        name: newLocation.name,
        type: newLocation.type,
      })
    if (error) {
      alert(error.message)
    } else {
      setShowModal(false)
      setNewLocation({ name: '', type: 'store' })
      fetchLocations()
    }
  }

  if (loading) return <div>Loading locations...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Locations</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Location
        </button>
      </div>

      {locations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded shadow">
          <p className="text-gray-500">No locations yet. Add your first location!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map((loc) => (
            <div key={loc.id} className="bg-white p-4 rounded shadow hover:shadow-md transition">
              <Link href={`/dashboard/locations/${loc.id}`}>
                <h3 className="text-lg font-semibold">{loc.name}</h3>
                <p className="text-sm text-gray-500">{loc.type}</p>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Add Location Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Location</h2>
            <form onSubmit={handleAddLocation}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Location Name</label>
                <input
                  type="text"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={newLocation.type}
                  onChange={(e) => setNewLocation({ ...newLocation, type: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="store">Store (retail – pieces)</option>
                  <option value="warehouse">Warehouse (bulk – boxes)</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
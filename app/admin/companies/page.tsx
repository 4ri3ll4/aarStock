'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function CompanyDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [company, setCompany] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [editingLocation, setEditingLocation] = useState<any>(null)
  const [locationForm, setLocationForm] = useState({ name: '', type: 'store' })
  const [showUserModal, setShowUserModal] = useState(false)
  const [userForm, setUserForm] = useState({ email: '', username: '', role: 'user' })

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
      .order('created_at', { ascending: true })

    setCompany(companyData)
    setUsers(usersData || [])
    setLocations(locationsData || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchCompanyData()
  }, [id])

  // ---- LOCATION CRUD ----
  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase
      .from('locations')
      .insert({
        company_id: id,
        name: locationForm.name,
        type: locationForm.type,
      })
    if (error) {
      alert(error.message)
    } else {
      setShowLocationModal(false)
      setLocationForm({ name: '', type: 'store' })
      fetchCompanyData()
    }
  }

  const handleEditLocation = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase
      .from('locations')
      .update({ name: locationForm.name, type: locationForm.type })
      .eq('id', editingLocation.id)
    if (error) {
      alert(error.message)
    } else {
      setShowLocationModal(false)
      setEditingLocation(null)
      setLocationForm({ name: '', type: 'store' })
      fetchCompanyData()
    }
  }

  const handleDeleteLocation = async (locationId: string) => {
    if (!confirm('Delete this location? This will also delete all stock associated with it.')) return
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', locationId)
    if (error) {
      alert(error.message)
    } else {
      fetchCompanyData()
    }
  }

  const openEditLocation = (location: any) => {
    setEditingLocation(location)
    setLocationForm({ name: location.name, type: location.type })
    setShowLocationModal(true)
  }

  // ---- USER CRUD ----
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    // First, create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userForm.email,
      password: 'temporary123',
      email_confirm: true,
    })
    if (authError) {
      alert(authError.message)
      return
    }
    if (authData.user) {
      const { error } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          company_id: id,
          username: userForm.username,
          role: userForm.role,
          is_super_admin: false,
        })
      if (error) {
        alert(error.message)
      } else {
        setShowUserModal(false)
        setUserForm({ email: '', username: '', role: 'user' })
        fetchCompanyData()
      }
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Delete this user?')) return
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)
    if (error) {
      alert(error.message)
    } else {
      fetchCompanyData()
    }
  }

  if (loading) return <div>Loading...</div>
  if (!company) return <div>Company not found</div>

  return (
    <div>
      {/* Company Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">{company.name}</h1>
          <p className="text-gray-500">Subdomain: {company.subdomain}</p>
          <p className="text-sm text-gray-400">ID: {company.id}</p>
        </div>
        <button
          onClick={() => router.push('/admin/companies')}
          className="text-blue-600 hover:underline"
        >
          ← Back to Companies
        </button>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ---- LOCATIONS ---- */}
        <div className="bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Locations</h2>
            <button
              onClick={() => {
                setEditingLocation(null)
                setLocationForm({ name: '', type: 'store' })
                setShowLocationModal(true)
              }}
              className="text-blue-600 text-sm hover:underline"
            >
              + Add Location
            </button>
          </div>
          {locations.length === 0 ? (
            <p className="text-gray-400">No locations yet</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {locations.map((loc) => (
                <li key={loc.id} className="py-2 flex justify-between items-center">
                  <div>
                    <span className="font-medium">{loc.name}</span>
                    <span className={`ml-2 text-xs px-2 py-1 rounded ${
                      loc.type === 'store' ? 'bg-purple-100 text-purple-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {loc.type}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditLocation(loc)}
                      className="text-gray-500 hover:text-blue-600 text-sm"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteLocation(loc.id)}
                      className="text-gray-500 hover:text-red-600 text-sm"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ---- USERS ---- */}
        <div className="bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Users</h2>
            <button
              onClick={() => {
                setUserForm({ email: '', username: '', role: 'user' })
                setShowUserModal(true)
              }}
              className="text-blue-600 text-sm hover:underline"
            >
              + Add User
            </button>
          </div>
          {users.length === 0 ? (
            <p className="text-gray-400">No users yet</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {users.map((user) => (
                <li key={user.id} className="py-2 flex justify-between items-center">
                  <div>
                    <span className="font-medium">{user.username}</span>
                    <span className={`ml-2 text-xs px-2 py-1 rounded ${
                      user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'manager' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-gray-500 hover:text-red-600 text-sm"
                  >
                    🗑️ Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ---- LOCATION MODAL ---- */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingLocation ? 'Edit Location' : 'Add New Location'}
            </h2>
            <form onSubmit={editingLocation ? handleEditLocation : handleAddLocation}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Location Name</label>
                <input
                  type="text"
                  value={locationForm.name}
                  onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={locationForm.type}
                  onChange={(e) => setLocationForm({ ...locationForm, type: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="store">Store (retail – pieces)</option>
                  <option value="warehouse">Warehouse (bulk – boxes)</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowLocationModal(false)
                    setEditingLocation(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingLocation ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- USER MODAL ---- */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New User</h2>
            <form onSubmit={handleAddUser}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  value={userForm.username}
                  onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="user">User</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="mb-4 text-sm text-gray-500">
                Note: A temporary password will be sent to the user's email.
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
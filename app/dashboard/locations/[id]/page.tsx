'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LocationDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [location, setLocation] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLocation = async () => {
      const { data } = await supabase
        .from('locations')
        .select('*')
        .eq('id', id)
        .single()
      setLocation(data)
      setLoading(false)
    }
    fetchLocation()
  }, [id])

  if (loading) return <div>Loading...</div>
  if (!location) return <div>Location not found</div>

  return (
    <div>
      <button onClick={() => router.back()} className="text-blue-600 hover:underline mb-4">
        ← Back
      </button>
      <h1 className="text-2xl font-bold">{location.name}</h1>
      <p className="text-gray-500">Type: {location.type}</p>
      <p className="text-sm text-gray-400">ID: {location.id}</p>
      {/* TODO: Add stock management, products, etc. */}
    </div>
  )
}
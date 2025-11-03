'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function TestLoginPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Session check:', session)
      setUser(session?.user || null)
      setLoading(false)
    }
    checkSession()
  }, [])

  if (loading) {
    return <div className="p-8">Checking session...</div>
  }

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Not logged in</h1>
        <p>No session found</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-green-600">Login Successful!</h1>
      <p className="mt-4">Logged in as: {user.email}</p>
      <p className="mt-2">User ID: {user.id}</p>
      <pre className="mt-4 p-4 bg-gray-100 rounded">
        {JSON.stringify(user, null, 2)}
      </pre>
    </div>
  )
}

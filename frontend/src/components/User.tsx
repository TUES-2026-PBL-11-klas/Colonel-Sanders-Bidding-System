import { useState, useEffect } from 'react'
import { authService } from '../services/authService'

interface DecodedToken {
  email?: string
  [key: string]: unknown
}

export default function User() {
  const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUserData()
  }, [])

  const parseJwt = (token: string): DecodedToken | null => {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
          })
          .join('')
      )

      const decoded = JSON.parse(jsonPayload)
      return {
        email: decoded.sub
      }
    } catch (e) {
      console.error('Failed to parse JWT:', e)
      return null
    }
  }

  const fetchUserData = async () => {
    try {
      setLoading(true)
      const token = authService.getToken()
      if (!token) {
        throw new Error('no token available')
      }
      const decoded = parseJwt(token)
      if (!decoded) {
        throw new Error('failed to decode token')
      }
      setDecodedToken(decoded)
    } catch (err) {
      console.error('Error fetching user data:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading)
    return <div className="bg-white p-6 rounded-lg shadow-md">Loading...</div>

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">User Profile</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {decodedToken ? (
        <p className="text-gray-700 mb-2">
          Email:{' '}
          <span className="font-semibold">{decodedToken.email || '-'}</span>
        </p>
      ) : (
        <p>No token data available</p>
      )}
    </div>
  )
}
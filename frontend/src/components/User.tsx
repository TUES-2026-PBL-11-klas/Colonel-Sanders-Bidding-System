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
  const [usersCsvFile, setUsersCsvFile] = useState<File | null>(null)
  const [isUploadingUsersCsv, setIsUploadingUsersCsv] = useState(false)
  const [importMessage, setImportMessage] = useState('')
  const [importError, setImportError] = useState('')
  const canManageImports = authService.isAdmin()

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
        email: decoded.sub,
        role: decoded.role
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

  const handleUsersCsvUpload = async () => {
    if (!canManageImports) {
      setImportError('You are not allowed to upload user CSV files.')
      return
    }

    if (!usersCsvFile) {
      setImportError('Please select a CSV file first.')
      return
    }

    try {
      setIsUploadingUsersCsv(true)
      setImportError('')
      setImportMessage('')

      const result = await authService.importUsersCsv(usersCsvFile)
      setImportMessage(
        `Processed: ${result.processed}, Created: ${result.created}, Skipped: ${result.skipped}, Failed: ${result.failed}`
      )
      setUsersCsvFile(null)
    } catch (err) {
      setImportError(
        err instanceof Error ? err.message : 'Failed to import users CSV'
      )
    } finally {
      setIsUploadingUsersCsv(false)
    }
  }

  if (loading)
    return <div className="bg-white p-6 rounded-lg shadow-md">Loading...</div>

  const isAdmin = decodedToken?.role && Array.isArray(decodedToken.role) && decodedToken.role.includes('ROLE_ADMIN')

  return (
    <div className="min-h-screen bg-blue-50/30 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-bold mb-4">User Profile</h2>
          {error && <p className="text-red-600 mb-4">{error}</p>}

          {decodedToken ? (
            <>
              <p className="text-gray-700 mb-2">
                Email:{' '}
                <span className="font-semibold">{decodedToken.email || '-'}</span>
              </p>
              <p className="text-gray-700 mb-2">
                Role:{' '}
                <span className="font-semibold">
                  {isAdmin ? 'Admin' : 'User'}
                </span>
              </p>
            </>
          ) : (
            <p>No token data available</p>
          )}
        </div>

        {canManageImports && (
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-center gap-3 max-w-2xl mx-auto">
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(event) => {
                  setUsersCsvFile(event.target.files?.[0] ?? null)
                  setImportError('')
                  setImportMessage('')
                }}
                className="block w-full h-12 text-base text-gray-700 border border-gray-300 rounded-md px-3 py-0 leading-12 file:mr-4 file:h-8 file:rounded-md file:border file:border-gray-300 file:bg-transparent file:px-4 file:py-0 file:text-base file:font-medium file:leading-8 file:text-gray-700"
              />
              <button
                type="button"
                onClick={handleUsersCsvUpload}
                disabled={isUploadingUsersCsv || !usersCsvFile}
                className="h-12 bg-teal-700 text-white border border-teal-700 px-8 text-base rounded-md min-w-56 whitespace-nowrap hover:bg-teal-950 hover:border-teal-950 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploadingUsersCsv ? 'Uploading...' : 'Upload Users CSV'}
              </button>
            </div>
            {importMessage && <p className="text-green-700 mt-3 text-center max-w-2xl mx-auto">{importMessage}</p>}
            {importError && <p className="text-red-600 mt-3 text-center max-w-2xl mx-auto">{importError}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
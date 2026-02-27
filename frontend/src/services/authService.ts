const API_BASE_URL = 'http://localhost:8080/api'
const TOKEN_KEY = 'authToken'     // storage key

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  needsPasswordReset: boolean
  user: {
    id: string
    email: string
    name: string
  }
}

interface DecodedAuthToken {
  role?: string[] | string
  roles?: string[] | string
  [key: string]: unknown
}

const decodeToken = (token: string): DecodedAuthToken | null => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )

    return JSON.parse(jsonPayload) as DecodedAuthToken
  } catch {
    return null
  }
}

const normalizeRoles = (value: string[] | string | undefined): string[] => {
  if (!value) {
    return []
  }

  if (Array.isArray(value)) {
    return value
  }

  return [value]
}

export interface UserImportResult {
  processed: number
  created: number
  skipped: number
  failed: number
  errors: string[]
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Send and receive cookies
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Login failed')
    }

    const data: LoginResponse = await response.json()
    // store a copy of the token so we can read it later
    try {
      localStorage.setItem(TOKEN_KEY, data.token)
    } catch {
      // ignore storage errors if running in incognito/unsupported env
    }
    // Token is still also set by the server as an HTTP-only cookie
    return data
  },

  logout() {
    // Server clears the HTTP-only cookie
    localStorage.removeItem(TOKEN_KEY)
    return fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },

  getRoles(): string[] {
    const token = this.getToken()
    if (!token) {
      return []
    }

    const decoded = decodeToken(token)
    if (!decoded) {
      return []
    }

    return [
      ...normalizeRoles(decoded.role),
      ...normalizeRoles(decoded.roles),
    ]
  },

  isAdmin(): boolean {
    const roles = this.getRoles()
    return roles.includes('ROLE_ADMIN') || roles.includes('ADMIN')
  },

  async importUsersCsv(file: File): Promise<UserImportResult> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/auth/import-users`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      let message = 'User CSV import failed'

      try {
        const error = await response.json()
        message = error.message || error.error || message
      } catch {
        // keep default message
      }

      throw new Error(message)
    }

    return response.json()
  },
}

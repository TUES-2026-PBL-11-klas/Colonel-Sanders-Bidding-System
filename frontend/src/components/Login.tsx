import { useState } from 'react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Posle shte go sloja
        alert(`Successfully logged in`)
    }

  return (
    <div className="flex items-center justify-center py-20 bg-blue-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login to CrispyBid</h2>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            id="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none
             focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 mb-2">Password</label>
          <input
            type="password"
            id="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none
             focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button 
          type="submit"
          className="w-full bg-teal-700 text-white py-3 rounded-2xl font-semibold text-lg
           transition-all duration-200 ease-in-out hover:bg-teal-950 hover:shadow-lg
            active:scale-95 cursor-pointer"
        >
          Login
        </button>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Forgot your password? <a href="#" className="text-teal-700 hover:underline">Reset Password</a>
          </p>
        </div>
      </form>
    </div>
  )
}

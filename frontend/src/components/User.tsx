import { useState } from 'react'

// User page (WIP)
export default function User() {
  const [] = useState(0)

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">User Profile</h2>
        <p className="text-gray-700 mb-2">Name: <h2 className="font-semibold">John Doe</h2></p>
        <p className="text-gray-700 mb-2">Email: <h2 className="font-semibold">john.doe@example.com</h2></p>
        <p className='text-gray-700 mb-2'>Role: <h2 className="font-semibold">Regular User</h2></p>
    </div>
  )
}
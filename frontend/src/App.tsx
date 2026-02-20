import { useState } from 'react'
import Navbar from './navbar.tsx'

function App() {
  const [] = useState(0)

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 >Welcome</h1>
      </div>
    </>
  )
}

export default App

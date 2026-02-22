import { useState } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Hero from './components/Hero'
import Dashboard from './components/Dashboard'
import "./tailwind.css"

function App() {
  const [] = useState(0)

  return (
    <div className="bg-blue-50 w-full min-h-screen overflow-x-hidden flex flex-col">
      <Navbar />
      <main className="grow">
        <Hero />
        <Dashboard />
        <div className="container mx-auto p-4">
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default App

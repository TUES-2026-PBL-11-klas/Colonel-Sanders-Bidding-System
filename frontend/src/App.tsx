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
      <main className="grow w-full">
        <div className="layout-16by9 px-4 sm:px-6 lg:px-8 space-y-6 lg:space-y-10">
          <Hero />
          <Dashboard />
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default App

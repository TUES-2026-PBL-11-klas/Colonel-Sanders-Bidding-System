import { useState } from 'react'
import "./tailwind.css"

function Navbar() {
  const [] = useState(0)

  return (
    <>
      <div className= "bg-gray-800 text-white p-3 md:flex">
        <div className="text-xl font-bold mr-8">
            <a href='/'>CrispyBid</a>
        </div>
        <div className="space-x-4 md:mt-0.5">
            <a href='/'>Page 1</a>
            <a href='/'>Page 2</a>
            <a href='/'>Page 3</a>
        </div>
        <div className="ml-auto">
            <a href='/login'>Login</a>
        </div>
      </div>
    </>
  )
}

export default Navbar
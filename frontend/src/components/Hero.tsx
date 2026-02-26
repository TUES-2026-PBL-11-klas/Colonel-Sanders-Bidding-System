import { useEffect, useRef, useState } from 'react'

export default function Hero() {
  const textRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold: 0.1 }
    )
    if (textRef.current) observer.observe(textRef.current)
    return () => observer.disconnect()
  }, [])

  const slowScrollBy = (distance: number) => {
    const startY = window.scrollY
    const duration = 900
    const startTime = performance.now()

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeInOutCubic(progress)

      window.scrollTo(0, startY + distance * easedProgress)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }

  return (
    <>
      <style>{`
        @keyframes customReveal {
          0% { opacity: 0; transform: translateY(30px) scale(0.97); }
          60% { transform: translateY(0px) scale(1); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .reveal-hidden { opacity: 0; }
        .animate-reveal { animation: customReveal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .d-1 { animation-delay: 0.1s; }
        .d-2 { animation-delay: 0.25s; }
        .d-3 { animation-delay: 0.4s; }
        .d-4 { animation-delay: 0.55s; }
      `}</style>

      {/* Main Container */}
      <div className="flex flex-col lg:flex-row w-full max-w-7xl mx-auto min-h-[calc(100vh-3rem)] lg:min-h-144 xl:min-h-160 lg:h-auto p-3 lg:p-11 overflow-visible bg-blue-50/50 mb-12 lg:mb-0 rounded-4xl">
        
        {/* Image Section */}
        <div className="flex-1 min-h-0 w-full lg:w-1/2 flex justify-center items-center overflow-hidden order-first lg:order-last select-none p-4 lg:p-6">
          <img 
            src="/images/HeroGraphic.png" 
            alt="Hero" 
            className={`max-w-full max-h-full object-contain reveal-hidden ${visible ? 'animate-reveal d-3' : ''}`}
          />
        </div>
        
        <div className="hidden lg:block w-1 bg-blue-50"></div>
        
        {/* Text Content */}
        <div 
          ref={textRef}
          className="w-full lg:w-1/2 flex flex-col justify-center items-start px-8 lg:px-12 xl:px-20 py-8 lg:py-0 text-left rounded-[2.5rem] lg:rounded-[3rem] shadow-2xl bg-white relative overflow-hidden mb-4 lg:mb-0"
        >
          <h1 className={`font-montserrat text-3xl lg:text-5xl xl:text-6xl font-bold text-gray-800 mb-3 lg:mb-6 reveal-hidden ${
            visible ? 'animate-reveal' : ''
          }`}>
            Your Best Offer. <span className="text-teal-700">One Shot.</span>
          </h1>
          
          <p className={`text-sm lg:text-lg xl:text-2xl text-gray-500 mb-6 lg:mb-8 max-w-lg reveal-hidden ${
            visible ? 'animate-reveal d-1' : ''
          }`}>
            Submit your blind bid and outsmart the competition. The ultimate private, fair, and high-stakes marketplace.
          </p>
          

          <div className={`pt-4 border-t border-gray-100 w-full reveal-hidden ${visible ? 'animate-reveal d-4' : ''}`}>
             <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
               <button 
                 className="order-first bg-teal-700 text-white px-8 lg:px-7 py-3 lg:py-3 rounded-2xl font-semibold text-base lg:text-base w-full lg:w-auto
                   transition-all duration-200 ease-in-out
                   hover:bg-teal-950 hover:scale-105 active:scale-95 hover:shadow-lg focus:outline-none cursor-pointer"
                 onClick={() => slowScrollBy(window.innerHeight * 0.6)}
               >
                 Take me to the dashboard
               </button>

               <div className="order-last lg:order-first">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Trusted by users at</p>
                 <div className="flex gap-4 lg:gap-6 opacity-30 grayscale items-center">
                    <span className="font-bold text-xs lg:text-sm tracking-tighter">TUES</span>
                    <span className="font-semibold text-xs lg:text-sm">Siemens</span>
                 </div>
               </div>

             </div>
          </div>
        </div>
      </div>
    </>
  )
}
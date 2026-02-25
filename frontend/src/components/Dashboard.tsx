import { useState, useCallback, useRef } from 'react';

const MOCK_PRODUCTS = [
  {
    id: 1,
    model: "Eames Lounge Chair & Ottoman Special Edition",
    type: "Premium Furniture",
    serial: "HML-90210-EV",
    description: "Original 1956 design features black top-grain leather and a walnut veneer shell. Corporate surplus from executive headquarters.",
    basePrice: 4200.00, 
    images: ["/images/HeroGraphic.png"]
  },
  {
    id: 2,
    model: "Mac Studio M2 Ultra & Studio Display",
    type: "IT Infrastructure",
    serial: "APL-MS-M2U",
    description: "High-performance workstation configuration. 24-core CPU and 76-core GPU. Decommissioned from creative department.",
    basePrice: 3999.99,
    images: ["/images/HeroGraphic.png"] 
  }
];

export default function InventoryDashboard() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const current = MOCK_PRODUCTS[currentIndex];
  const formatInventoryId = (id: number) => `INV - ${String(id).padStart(3, '0')}`;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === MOCK_PRODUCTS.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? MOCK_PRODUCTS.length - 1 : prev - 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const swipeThreshold = 50;
    const distance = touchStartX.current - touchEndX.current;
    if (Math.abs(distance) > swipeThreshold) {
      if (distance > 0) nextSlide();
      else prevSlide();
    }
  };

  return (
    <section className="w-full min-h-screen py-6 px-0 flex flex-col items-center bg-blue-50 rounded-4xl">
      
      {/* Minimalist Navigation Header */}
      <div className="w-full max-w-7xl flex justify-between items-center mb-6 lg:mb-10 px-4 sm:px-2">
        <div className="flex flex-col">
          <h2 className="text-xl lg:text-3xl font-bold text-gray-800 font-montserrat">Current <span className="text-teal-700">Dsicovery Dashboard</span></h2>
        </div>
        
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
           <button onClick={prevSlide} className="text-gray-400 hover:text-teal-700 transition-colors">
             <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
           </button>
           <span className="text-xs font-bold font-mono text-gray-300">
             {currentIndex + 1} / {MOCK_PRODUCTS.length}
           </span>
           <button onClick={nextSlide} className="text-gray-400 hover:text-teal-700 transition-colors">
             <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
           </button>
        </div>
      </div>

      {/* The Dashboard Box - Optimized Height */}
      <div
        key={`inventory-${currentIndex}`}
        className="relative w-full max-w-7xl bg-white rounded-4xl lg:rounded-[3rem] shadow-2xl border border-gray-100 flex flex-col lg:flex-row overflow-hidden min-h-112 lg:min-h-128"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Left: Visual Asset (40%) */}
        <div className="w-full lg:w-1/2 bg-slate-50 flex items-center justify-center p-6 sm:p-8 relative overflow-hidden shrink-0 h-64 sm:h-80 lg:h-auto">
          <img 
            key={`img-${currentIndex}`}
            src={current.images[0]} 
            alt="Asset" 
            className="max-w-full max-h-full object-contain mix-blend-multiply opacity-90 animate-reveal"
          />
          <div className="absolute top-6 left-6 px-3 py-1 bg-white/80 backdrop-blur rounded-full border border-gray-100 shadow-sm">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{formatInventoryId(current.id)}</p>
          </div>
        </div>

        {/* Right: Asset Intelligence (60%) */}
        <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-14 flex flex-col bg-white overflow-hidden">
          <div className="flex-1 overflow-y-auto no-scrollbar mb-6">
            <div className="flex items-center gap-3 mb-4">
               <span className="h-px w-8 bg-teal-700/30" />
               <span className="text-[10px] font-bold text-teal-600 uppercase tracking-[0.2em]">{current.type}</span>
            </div>
            
            <h3 className="font-montserrat text-2xl lg:text-3xl font-bold text-gray-800 mb-4 leading-tight">
              {current.model}
            </h3>
            
            <p className="text-gray-400 text-sm lg:text-base leading-relaxed max-w-md">
              {current.description}
            </p>
          </div>

          <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Starting Price</p>
              <p className="text-2xl font-bold text-slate-900 font-montserrat">
                €{current.basePrice.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] font-mono text-slate-300 mt-1 uppercase">ID: {current.serial}</p>
            </div>

            <button 
              className="bg-teal-700 text-white px-10 py-4 rounded-2xl font-bold text-sm tracking-wide
                transition-all duration-200 ease-in-out hover:bg-teal-950 hover:shadow-xl active:scale-95 w-full sm:w-auto"
            >
              Details
            </button>
          </div>

        </div>
      </div>

      {/* Progress Footer */}
      <div className="mt-8 flex gap-2">
        {MOCK_PRODUCTS.map((_, i) => (
          <div 
            key={i} 
            className={`h-1 rounded-full transition-all duration-500 ${i === currentIndex ? 'w-12 bg-teal-700' : 'w-4 bg-gray-200'}`}
          />
        ))}
      </div>

    </section>
  );
}
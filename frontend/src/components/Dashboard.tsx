import { useState, useEffect, useCallback, useRef } from 'react';

/* Mock products to substitute for the missing database entries during development */
const MOCK_PRODUCTS = [
  {
    id: 1,
    model: "Eames Lounge Chair & Ottoman Special Edition",
    type_id: 1,
    serial: "HML-90210-EV",
    description: "An original 1956 design features black top-grain leather and a walnut veneer shell. This special edition includes a polished chrome base and premium hide.",
    basePrice: 4200.00, 
    is_closed: false,
    images: ["/images/HeroGraphic.png", "/images/HeroGraphic.png", "/images/HeroGraphic.png", "/images/HeroGraphic.png"]
  },
  {
    id: 2,
    model: "Mac Studio M2 Ultra & Studio Display",
    type_id: 2,
    serial: "APL-MS-M2U",
    description: "The most powerful personal computer ever built. 24-core CPU and 76-core GPU. Perfect for 8K video editing and 3D rendering workflows.",
    basePrice: 3999.99,
    is_closed: false,
    images: ["/images/HeroGraphic.png", "/images/HeroGraphic.png", "/images/HeroGraphic.png"] 
  },
  {
    id: 3,
    model: "Leica M11 Rangefinder Silver Chrome",
    type_id: 3,
    serial: "LC-M11-8821",
    description: "Legendary M-series craftsmanship. Features a 60MP triple-resolution sensor and an iconic minimalist design for the purist photographer.",
    basePrice: 8995.50,
    is_closed: true,
    images: ["/images/HeroGraphic.png"]
  },
  {
    id: 4,
    model: "Vintage Rolex Submariner 5513",
    type_id: 3,
    serial: "RX-5513-VNT",
    description: "Iconic dive watch from the 1960s. Stainless steel with a black bezel and dial. Original tritium lume with a beautiful creamy patina.",
    basePrice: 15000.00,
    is_closed: false,
    images: ["/images/HeroGraphic.png", "/images/HeroGraphic.png"] 
  },
  {
    id: 5,
    model: "Herman Miller Aeron Chair Graphite",
    type_id: 1,
    serial: "HML-AERON-GPH",
    description: "The ultimate ergonomic office chair. Features breathable Pellicle mesh and adjustable PostureFit SL for all-day comfort and support.",
    basePrice: 1200.00,
    is_closed: true,
    images: ["/images/HeroGraphic.png", "/images/HeroGraphic.png", "/images/HeroGraphic.png", "/images/HeroGraphic.png", "/images/HeroGraphic.png"] 
  }
];

const MOCK_TYPES: Record<number, string> = {
  1: "Premium Furniture",
  2: "Computing",
  3: "Photography"
};

const formatEuro = (amount: number) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

const isImageUrl = (str: string): boolean => {
  return str.startsWith('http://') || str.startsWith('https://') || str.startsWith('/');
};

const renderImageItem = (img: string) => {
  if (isImageUrl(img)) {
    return (
      <img
        key={img}
        src={img}
        alt="product"
        className="w-full h-full select-none object-cover"
      />
    );
  }
  return (
    <span key={img} className="w-full h-full select-none flex items-center justify-center bg-gray-300 text-4xl">
      {img}
    </span>
  );
};

const renderImages = (images: string[]) => {
  const count = images.length;

  if (count === 1) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        {renderImageItem(images[0])}
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className="relative w-full h-full">
        <div className="w-full h-full">
          {renderImageItem(images[0])}
        </div>
        <div className="absolute bottom-0 right-0 w-[40%] h-[40%] shadow-lg overflow-hidden">
          {renderImageItem(images[1])}
        </div>
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className="relative w-full h-full">
        <div className="w-full h-full">
          {renderImageItem(images[0])}
        </div>
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] shadow-lg overflow-hidden">
          {renderImageItem(images[1])}
        </div>
        <div className="absolute bottom-0 right-0 w-[40%] h-[40%] shadow-lg overflow-hidden">
          {renderImageItem(images[2])}
        </div>
      </div>
    );
  }

  if (count == 4) {
    return (
      <div className="flex flex-col w-full h-full gap-0">
        {[0, 2].map((startIdx) => (
          <div key={startIdx} className="flex-1 w-full flex gap-0">
            {images.slice(startIdx, startIdx + 2).map((img) => (
              <div key={img} className="flex-1 h-full">
                {renderImageItem(img)}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (count === 5) {
    return (
      <div className="relative w-full h-full">
        {/* Top-left */}
        <div className="absolute top-0 left-0 w-1/2 h-1/2">
          {renderImageItem(images[0])}
        </div>
        {/* Top-right */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2">
          {renderImageItem(images[1])}
        </div>
        {/* Bottom-left */}
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2">
          {renderImageItem(images[3])}
        </div>
        {/* Bottom-right */}
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2">
          {renderImageItem(images[4])}
        </div>
        {/* Center image */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55%] h-[55%] shadow-lg overflow-hidden rounded-lg z-10">
          {renderImageItem(images[2])}
        </div>
      </div>
    );
  }
  return null;
};

export default function ProductCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

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
    handleSwipe();
  };

  const handleSwipe = () => {
    const swipeThreshold = 50;
    const distance = touchStartX.current - touchEndX.current;
    if (Math.abs(distance) > swipeThreshold) {
      if (distance > 0) nextSlide();
      else prevSlide();
    }
  };

  useEffect(() => {
    const timer = setInterval(() => { nextSlide(); }, 5000);
    return () => clearInterval(timer);
  }, [currentIndex, nextSlide]);

  const current = MOCK_PRODUCTS[currentIndex];
  const isOpen = !current.is_closed;
  const categoryName = MOCK_TYPES[current.type_id] || "General Item";

  return (
    <>
      <style>{`
        @keyframes cardReveal {
          0% { transform: scale(1); opacity: 0.9; }
          20% { transform: scale(0.995); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .card-animate { animation: cardReveal 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <section className="w-full min-h-screen py-6 px-4 flex flex-col items-center bg-blue-50">
        
        <div className="text-center mb-6 lg:mb-10">
          <h2 className="font-montserrat text-3xl lg:text-5xl font-bold text-gray-800">
            Auction <span className="text-teal-700">Dashboard</span>
          </h2>
        </div>

        {/* Main Card Container */}
        <div 
          key={`carousel-${currentIndex}`} 
          className="card-animate relative w-full max-w-7xl xl:max-w-[90%] bg-white rounded-4xl lg:rounded-[3rem] shadow-2xl border border-gray-100 flex flex-col lg:flex-row overflow-hidden h-[calc(100vh-220px)] lg:h-[calc(100vh-220px)]" 
          onTouchStart={handleTouchStart} 
          onTouchEnd={handleTouchEnd}
        >
          
          {/* Desktop Navigation Arrows */}
          <button onClick={prevSlide} className="hidden lg:flex absolute left-6 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full bg-white/80 hover:bg-white shadow-xl text-slate-800 transition-all active:scale-90 items-center justify-center backdrop-blur-sm">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button onClick={nextSlide} className="hidden lg:flex absolute right-6 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full bg-white/80 hover:bg-white shadow-xl text-slate-800 transition-all active:scale-90 items-center justify-center backdrop-blur-sm">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
          </button>

          {/* Image Section */}
          <div className="w-full lg:w-1/2 bg-slate-50 flex items-center justify-center p-0 relative overflow-hidden shrink-0 h-64 sm:h-80 lg:h-auto">
             {renderImages(current.images)}
             
             <div className={`absolute top-6 left-6 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 z-10 ${
                isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                {isOpen ? 'Open' : 'Closed'}
             </div>
          </div>

          {/* Info Section */}
          <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-14 flex flex-col bg-white overflow-hidden">
            
            {/* Scrollable text area */}
            <div className="flex-1 overflow-y-auto no-scrollbar mb-6">
              <p className="text-teal-600 font-bold text-[10px] lg:text-xs uppercase tracking-[0.2em] mb-3">
                {categoryName}
              </p>
              
              <div className="mb-4 lg:mb-6">
                <h3 className="font-montserrat text-2xl sm:text-3xl xl:text-4xl font-bold text-gray-800 leading-tight line-clamp-3 mr-3">
                  {current.model}
                </h3>
                <p className="text-slate-400 text-xs font-mono mt-1 tracking-tighter">
                  {current.serial}
                </p>
              </div>

              <div className="border-l-4 border-teal-600/20 pl-4 py-1">
                <p className="text-slate-500 text-sm sm:text-base lg:text-lg leading-relaxed italic">
                  "{current.description}"
                </p>
              </div>
            </div>

            {/* Bottom Action Area */}
            <div className="mt-auto pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Starting Price</p>
                  <p className="text-lg lg:text-2xl font-black text-slate-900">{formatEuro(current.basePrice)}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Availability</p>
                  <p className={`text-sm font-bold ${isOpen ? 'text-emerald-600' : 'text-red-600'}`}>
                    {isOpen ? 'Accepting Bids' : 'Sold Out'}
                  </p>
                </div>
              </div>

              <button 
                disabled={!isOpen}
                className={`w-full py-4 lg:py-5 rounded-2xl font-bold text-base lg:text-lg transition-all duration-300 transform active:scale-[0.98] shadow-md border-2 ${
                  isOpen 
                  ? 'border-teal-800 text-teal-800 hover:bg-teal-800 hover:text-white' 
                  : 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                }`}
              >
                {isOpen ? 'Enter Bidding Room' : 'Auction Closed'}
              </button>
            </div>
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="flex gap-3 mt-8">
          {MOCK_PRODUCTS.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`transition-all duration-500 rounded-full h-2.5 ${
                currentIndex === index ? 'w-10 bg-teal-800' : 'w-2.5 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      </section>
    </>
  );
}
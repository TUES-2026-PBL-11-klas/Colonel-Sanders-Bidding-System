import { Link, useLocation } from "react-router-dom";

interface ProductCardProps {
  id: number;
  model: string;
  type: string;
  price: number;
  priceLabel: string;
  image: string;
  isClosed: boolean;
  serial: string;
}

export const ProductCard = ({ id, model, type, price, priceLabel, image, isClosed, serial }: ProductCardProps) => {
  const location = useLocation();
  const isOpen = !isClosed;
  const formatInventoryId = (id: number) => `INV - ${String(id).padStart(3, '0')}`;

  return (
    <Link
      to={`/auctions/${id}`}
      state={{ backgroundLocation: location }}
      aria-label={`View auction ${id}`}
      className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden flex flex-col"
    >
      {/* Image Container */}
      <div className="relative h-48 bg-slate-50 overflow-hidden">
        <img 
          src={image} 
          alt={model} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Status Badge */}
        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
          isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          {isOpen ? 'Open' : 'Closed'}
        </div>

        {/* ID Badge */}
        <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur rounded-lg border border-gray-100">
           <p className="text-[8px] font-black text-slate-400 uppercase tracking-tight">{formatInventoryId(id)}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <p className="text-teal-600 font-bold text-[9px] uppercase tracking-widest mb-1">{type}</p>
        <h4 className="font-montserrat font-bold text-gray-800 text-sm line-clamp-1 mb-1">{model}</h4>
        <p className="text-slate-400 text-[10px] mb-4">{serial}</p>

        <div className="mt-auto pt-3 border-t border-gray-50">
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-0.5">{priceLabel}</p>
          <p className="text-lg font-bold text-slate-900">€{price.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>
    </Link>
  );
};
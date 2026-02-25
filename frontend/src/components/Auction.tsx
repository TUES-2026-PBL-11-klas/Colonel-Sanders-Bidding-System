import { useState } from "react";
import { useParams } from "react-router-dom";
import { MOCK_PRODUCTS, MOCK_TYPES } from "../data/mock_data";

function Auction() {
    const { id } = useParams();
    const productId = Number(id);
    const product = MOCK_PRODUCTS.find((item) => item.id === productId);

    if (!product) {
        return (
            <section className="w-full py-16 px-4 flex flex-col items-center bg-blue-50 rounded-4xl">
                <h2 className="font-montserrat text-3xl lg:text-5xl font-bold text-gray-800 text-center">
                    Auction <span className="text-teal-700">Not Found</span>
                </h2>
                <p className="mt-4 text-slate-500 text-center">
                    The auction you are looking for does not exist.
                </p>
            </section>
        );
    }

    const typeById = new Map(MOCK_TYPES.map((type) => [type.id, type.name]));
    const productTypeName = typeById.get(product.type_id) ?? "Unknown Type";
    const images = product.images;
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const isOpen = !product.is_closed;
    const formatInventoryId = (id: number) => `INV - ${String(id).padStart(3, '0')}`;

    return (
        <section className="w-full py-6 px-0 flex flex-col items-center bg-blue-50 rounded-4xl">
            <div className="text-center mb-6 lg:mb-10">
                <h2 className="font-montserrat text-3xl lg:text-5xl font-bold text-gray-800">
                    Live <span className="text-teal-700">Auction</span>
                </h2>
            </div>

            <div className="w-full max-w-7xl mx-auto flex flex-col xl:flex-row gap-6 xl:gap-10 p-6 lg:p-10 pb-3 lg:pb-6 rounded-4xl lg:rounded-[3rem] bg-white shadow-2xl border border-gray-100">
                <div className="w-full xl:flex-1 flex flex-col xl:flex-row gap-4">
                    <div className="relative order-1 xl:order-2 flex-1 flex items-center justify-center bg-slate-50 rounded-2xl p-6 h-72 sm:h-96 lg:h-128 overflow-hidden">
                        {images.length > 0 ? (
                            <img
                                src={images[currentImageIndex]}
                                alt={`Product Image ${currentImageIndex + 1}`}
                                className="w-full h-full object-contain scale-110"
                            />
                        ) : (
                            <p className="text-slate-400">No images available</p>
                        )}

                        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                            isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                            <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                            {isOpen ? 'Open' : 'Closed'}
                        </div>

                        <div className="absolute top-4 right-4 px-3 py-1 bg-white/80 backdrop-blur rounded-full border border-gray-100 shadow-sm">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{formatInventoryId(product.id)}</p>
                        </div>
                    </div>

                    {images.length > 0 && (
                        <div className="order-2 xl:order-1 flex xl:flex-col items-center gap-2 overflow-x-auto xl:overflow-visible pb-1 xl:pb-0">
                            {images.map((img, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`shrink-0 rounded-xl border-2 overflow-hidden transition-all h-14 w-14 ${
                                        currentImageIndex === index ? "border-teal-700" : "border-gray-200"
                                    }`}
                                >
                                    <img
                                        src={img}
                                        alt={`Thumbnail ${index + 1}`}
                                        draggable={false}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="w-full xl:w-[44%] xl:pl-2 flex flex-col">
                    <p className="text-teal-600 font-bold text-[10px] lg:text-xs uppercase tracking-[0.2em] mb-3">
                        {productTypeName}
                    </p>

                    <h3 className="font-montserrat text-2xl sm:text-3xl xl:text-4xl font-bold text-gray-800 leading-tight mb-3">
                        {product.model}
                    </h3>
                    <p className="text-slate-400 text-xs tracking-tight mb-6">
                        {product.serial}
                    </p>

                    <p className="text-slate-500 text-sm sm:text-base lg:text-lg leading-relaxed mb-8">
                        {product.description}
                    </p>

                    <div className="mt-auto pt-4 border-t border-gray-100">
                        <div className="text-left mb-6">
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Availability</p>
                            <p className={`text-sm font-bold ${isOpen ? 'text-emerald-600' : 'text-red-600'}`}>
                                {isOpen ? 'Accepting Bids' : 'Sold Out'}
                            </p>
                        </div>
                        <div className="flex flex-col gap-6 mb-6">
                            <div>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Starting Price</p>
                                <p className="text-lg lg:text-2xl font-semibold text-slate-900">€{product.basePrice.toFixed(2)}</p>
                            </div>
                        </div>
                        <button
                            disabled={!isOpen}
                            className={`w-full h-16 rounded-2xl font-semibold text-base transition-all duration-300 border-2 mb-6 ${
                                isOpen
                                    ? 'bg-teal-700 border-teal-700 text-white hover:bg-teal-950 hover:border-teal-950'
                                    : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            {isOpen ? 'Place Bid' : 'Auction Closed'}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}


export default Auction;
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { MOCK_PRODUCTS, MOCK_TYPES } from "../data/mock_data";

interface AuctionProps {
    isModal?: boolean;
}

function Auction({ isModal = false }: AuctionProps) {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const backgroundLocation = location.state?.backgroundLocation;
    const productId = Number(id);
    const product = MOCK_PRODUCTS.find((item) => item.id === productId);
    const [isClosing, setIsClosing] = useState(false);
    const closeTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        if (!isModal) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
            if (closeTimeoutRef.current !== null) {
                window.clearTimeout(closeTimeoutRef.current);
            }
        };
    }, [isModal]);

    const closeModal = () => {
        const navigateToBackground = () => {
            if (backgroundLocation?.pathname) {
                navigate(`${backgroundLocation.pathname}${backgroundLocation.search ?? ''}${backgroundLocation.hash ?? ''}`, { replace: true });
                return;
            }

            navigate('/auctions');
        };

        if (!isModal) {
            navigateToBackground();
            return;
        }

        if (isClosing) {
            return;
        }

        setIsClosing(true);
        closeTimeoutRef.current = window.setTimeout(() => {
            navigateToBackground();
        }, 220);
    };

    if (!product) {
        if (isModal) {
            return (
                <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 ${isClosing ? 'animate-backdrop-fade-out' : 'animate-backdrop-fade'}`}>
                    <div className={`w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 text-center ${isClosing ? 'animate-popup-out' : 'animate-popup-in'}`}>
                        <h2 className="font-montserrat text-3xl font-bold text-gray-800">
                            Auction <span className="text-teal-700">Not Found</span>
                        </h2>
                        <p className="mt-4 text-slate-500">
                            The auction you are looking for does not exist.
                        </p>
                        <button
                            type="button"
                            onClick={closeModal}
                            className="mt-6 px-5 py-2.5 rounded-xl bg-teal-700 text-white font-semibold hover:bg-teal-950 transition"
                        >
                            Close
                        </button>
                    </div>
                </div>
            );
        }

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

    if (isModal) {
        return (
            <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-2 sm:p-4 ${isClosing ? 'animate-backdrop-fade-out' : 'animate-backdrop-fade'}`} onClick={closeModal}>
                <div
                    className={`relative w-[min(96vw,1180px)] h-[min(90vh,760px)] overflow-hidden bg-blue-50 rounded-4xl shadow-2xl ${isClosing ? 'animate-popup-out' : 'animate-popup-in'}`}
                    onClick={(event) => event.stopPropagation()}
                >
                    <button
                        type="button"
                        onClick={closeModal}
                        className="absolute top-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 border border-gray-200 shadow-sm hover:text-slate-900"
                        aria-label="Close auction popup"
                    >
                        ×
                    </button>

                    <section className="h-full w-full px-3 py-4 sm:px-4 sm:py-5 lg:px-5 lg:py-6 flex flex-col items-center bg-blue-50 rounded-4xl">
                        <div className="w-full flex-1 min-h-0 max-w-7xl mx-auto flex flex-col xl:flex-row gap-4 xl:gap-6 p-4 lg:p-6 rounded-4xl lg:rounded-[3rem] bg-white border border-gray-100 shadow-2xl">
                            <div className="w-full xl:flex-1 min-h-0 flex flex-col xl:flex-row gap-3">
                                <div className="relative order-1 xl:order-2 flex-1 min-h-0 flex items-center justify-center bg-slate-50 rounded-2xl p-4 lg:p-5 h-56 sm:h-72 xl:h-full overflow-hidden">
                                    {images.length > 0 ? (
                                        <img
                                            src={images[currentImageIndex]}
                                            alt={`Product Image ${currentImageIndex + 1}`}
                                            className="w-full h-full object-contain"
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

                            <div className="w-full xl:w-[42%] xl:pl-1 flex flex-col min-h-0">
                                <p className="text-teal-600 font-bold text-[10px] lg:text-xs uppercase tracking-[0.2em] mb-2">
                                    {productTypeName}
                                </p>

                                <h3 className="font-montserrat text-xl sm:text-2xl xl:text-3xl font-bold text-gray-800 leading-tight mb-2">
                                    {product.model}
                                </h3>
                                <p className="text-slate-400 text-xs tracking-tight mb-3">
                                    {product.serial}
                                </p>

                                <div className="mb-4 max-h-32 overflow-y-auto pr-1">
                                    <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
                                        {product.description}
                                    </p>
                                </div>

                                <div className="mt-auto pt-3 border-t border-gray-100">
                                    <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 mb-4 items-stretch">
                                        <div className="text-left order-2 sm:order-1 h-full flex flex-col justify-center">
                                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Availability</p>
                                            <p className={`text-sm font-bold ${isOpen ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {isOpen ? 'Accepting Bids' : 'Sold Out'}
                                            </p>
                                        </div>
                                        <div className="text-left order-1 sm:order-2 h-full flex flex-col justify-center">
                                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Starting Price</p>
                                            <p className="text-lg lg:text-2xl font-semibold text-slate-900">€{product.basePrice.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <button
                                        disabled={!isOpen}
                                        className={`w-full h-14 rounded-2xl font-semibold text-base transition-all duration-300 border-2 ${
                                            isOpen
                                                ? 'bg-teal-700 border-teal-700 text-white hover:bg-teal-950 hover:border-teal-950 cursor-pointer'
                                                : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        {isOpen ? 'Place Bid' : 'Auction Closed'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        );
    }

    return (
        <section className="w-full py-6 px-0 flex flex-col items-center bg-blue-50 rounded-4xl">
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
                        <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 mb-6 items-stretch">
                            <div className="text-left order-2 sm:order-1 h-full flex flex-col justify-center">
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Availability</p>
                                <p className={`text-sm font-bold ${isOpen ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {isOpen ? 'Accepting Bids' : 'Sold Out'}
                                </p>
                            </div>
                            <div className="text-left order-1 sm:order-2 h-full flex flex-col justify-center">
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Starting Price</p>
                                <p className="text-lg lg:text-2xl font-semibold text-slate-900">€{product.basePrice.toFixed(2)}</p>
                            </div>
                        </div>
                        <button
                            disabled={!isOpen}
                            className={`w-full h-16 rounded-2xl font-semibold text-base transition-all duration-300 border-2 mb-6${
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
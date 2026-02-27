import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { auctionsService } from "../services/auctionsService";
import type { Auction as AuctionModel } from "../services/auctionsService";

const FALLBACK_IMAGE = "/images/HeroGraphic.png";

interface AuctionProps {
    isModal?: boolean;
}

function Auction({ isModal = false }: AuctionProps) {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const backgroundLocation = location.state?.backgroundLocation;
    const productId = Number(id);
    const [product, setProduct] = useState<AuctionModel | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isClosing, setIsClosing] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isBidPopupOpen, setIsBidPopupOpen] = useState(false);
    const [bidAmountInput, setBidAmountInput] = useState("");
    const [bidError, setBidError] = useState<string | null>(null);
    const [isPlacingBid, setIsPlacingBid] = useState(false);
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

    useEffect(() => {
        if (!Number.isFinite(productId) || productId <= 0) {
            setProduct(null);
            setIsLoading(false);
            setError("Invalid auction ID");
            return;
        }

        let isMounted = true;

        const loadAuction = async () => {
            try {
                const data = await auctionsService.getAuctionById(productId);
                if (isMounted) {
                    setProduct(data);
                }
            } catch (loadError) {
                if (isMounted) {
                    setProduct(null);
                    setError(loadError instanceof Error ? loadError.message : "Failed to load auction");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadAuction();

        return () => {
            isMounted = false;
        };
    }, [productId]);

    useEffect(() => {
        setCurrentImageIndex(0);
    }, [product?.id]);

    useEffect(() => {
        setIsBidPopupOpen(false);
        setBidAmountInput("");
        setBidError(null);
    }, [product?.id, product?.closed]);

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

    if (isLoading) {
        return (
            <section className="w-full py-16 px-4 flex flex-col items-center bg-blue-50 rounded-4xl">
                <p className="text-slate-500">Loading auction...</p>
            </section>
        );
    }

    if (error && !product) {
        if (isModal) {
            return (
                <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 ${isClosing ? 'animate-backdrop-fade-out' : 'animate-backdrop-fade'}`}>
                    <div className={`w-full max-w-2xl bg-white shadow-2xl border border-gray-100 p-8 text-center ${isClosing ? 'animate-popup-out' : 'animate-popup-in'}`}>
                        <h2 className="font-montserrat text-3xl font-bold text-gray-800">
                            Auction <span className="text-teal-700">Error</span>
                        </h2>
                        <p className="mt-4 text-slate-500">{error}</p>
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
            <section className="w-full py-16 px-4 flex flex-col items-center bg-blue-50">
                <h2 className="font-montserrat text-3xl lg:text-5xl font-bold text-gray-800 text-center">
                    Auction <span className="text-teal-700">Error</span>
                </h2>
                <p className="mt-4 text-slate-500 text-center">{error}</p>
            </section>
        );
    }

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

    const productTypeName = product.productType?.name ?? "Unknown Type";
    const images = product.imageObjectKey ? [product.imageObjectKey] : [FALLBACK_IMAGE];
    const isOpen = !product.closed;
    const formatInventoryId = (id: number) => `INV - ${String(id).padStart(3, '0')}`;

    const handlePlaceBid = async () => {
        if (!isOpen || isPlacingBid) {
            return;
        }

        if (!isBidPopupOpen) {
            setIsBidPopupOpen(true);
            setBidError(null);
            return;
        }

        const bidValue = Number.parseFloat(bidAmountInput);
        if (!Number.isFinite(bidValue) || bidValue <= 0) {
            setBidError("Enter a valid bid amount.");
            return;
        }

        try {
            setIsPlacingBid(true);
            setBidError(null);
            await auctionsService.placeBid(product.id, bidValue);
            setBidAmountInput("");
            setIsBidPopupOpen(false);
        } catch (placeBidError) {
            setBidError(placeBidError instanceof Error ? placeBidError.message : "Failed to place bid");
        } finally {
            setIsPlacingBid(false);
        }
    };

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
                        className="absolute top-3 right-3 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white text-5xl leading-none text-slate-600 border border-gray-200 shadow-sm hover:text-slate-900"
                        aria-label="Close auction popup"
                    >
                        ×
                    </button>

                    <div className="h-full w-full p-4 sm:p-5 lg:p-6 flex flex-col xl:flex-row gap-4 xl:gap-6 bg-white border border-gray-100 shadow-2xl rounded-4xl lg:rounded-[3rem]">
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
                                    <div className={`relative transition-[padding] duration-300 ${isBidPopupOpen ? 'sm:pr-44 lg:pr-56' : 'pr-0'}`}>
                                        <div className={`absolute inset-x-0 bottom-0 z-20 sm:inset-x-auto sm:right-0 sm:top-0 sm:bottom-0 origin-bottom sm:origin-right transition-all duration-300 mx-2 mb-2 sm:mx-0 sm:mb-0 sm:h-full rounded-2xl border border-gray-200 bg-white shadow-xl p-4 sm:p-3 w-auto sm:w-44 lg:w-56 flex flex-col justify-center ${isBidPopupOpen ? 'opacity-100 translate-y-0 sm:translate-y-0 sm:translate-x-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-6 sm:translate-y-0 sm:translate-x-2 scale-95 pointer-events-none'}`}>
                                            <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2" htmlFor="bid-amount-modal">
                                                Your Bid
                                            </label>
                                            <input
                                                id="bid-amount-modal"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={bidAmountInput}
                                                onChange={(event) => {
                                                    setBidAmountInput(event.target.value);
                                                    if (bidError) {
                                                        setBidError(null);
                                                    }
                                                }}
                                                placeholder="Amount"
                                                className="w-full h-14 sm:h-16 rounded-xl border border-gray-300 px-3 text-sm text-slate-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:ring-2 focus:ring-teal-700/30 focus:border-teal-700"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 mb-4 items-stretch">
                                            <div className="text-left order-2 sm:order-1 h-full flex flex-col justify-center">
                                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Availability</p>
                                                <p className={`text-sm font-bold ${isOpen ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {isOpen ? 'Accepting Bids' : 'Sold Out'}
                                                </p>
                                            </div>
                                            <div className="text-left order-1 sm:order-2 h-full flex flex-col justify-center">
                                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Starting Price</p>
                                                <p className="text-lg lg:text-2xl font-semibold text-slate-900">€{product.startingPrice.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={!isOpen || isPlacingBid}
                                        onClick={handlePlaceBid}
                                        className={`w-full h-14 rounded-2xl font-semibold text-base transition-all duration-300 border-2 ${
                                            isOpen
                                                ? 'bg-teal-700 border-teal-700 text-white hover:bg-teal-950 hover:border-teal-950 cursor-pointer'
                                                : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        {isOpen ? (isPlacingBid ? 'Placing Bid...' : 'Place Bid') : 'Auction Closed'}
                                    </button>
                                    {bidError && <p className="mt-2 text-xs text-red-600">{bidError}</p>}

                                </div>
                            </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <section className="w-full max-w-7xl mx-auto py-6 px-0 flex flex-col xl:flex-row gap-6 xl:gap-10 p-6 lg:p-10 pb-3 lg:pb-6 rounded-4xl lg:rounded-[3rem] bg-white shadow-2xl border border-gray-100">
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
                        <div className={`relative transition-[padding] duration-300 ${isBidPopupOpen ? 'sm:pr-44 lg:pr-56' : 'pr-0'}`}>
                            <div className={`fixed inset-x-0 bottom-0 z-20 sm:absolute sm:inset-x-auto sm:right-0 sm:top-0 sm:bottom-0 origin-bottom sm:origin-right transition-all duration-300 mx-2 mb-2 sm:mx-0 sm:mb-0 sm:h-full rounded-2xl border border-gray-200 bg-white shadow-xl p-4 sm:p-3 w-auto sm:w-44 lg:w-56 flex flex-col justify-center ${isBidPopupOpen ? 'opacity-100 translate-y-0 sm:translate-y-0 sm:translate-x-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-6 sm:translate-y-0 sm:translate-x-2 scale-95 pointer-events-none'}`}>
                                <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2" htmlFor="bid-amount-page">
                                    Your Bid
                                </label>
                                <input
                                    id="bid-amount-page"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={bidAmountInput}
                                    onChange={(event) => {
                                        setBidAmountInput(event.target.value);
                                        if (bidError) {
                                            setBidError(null);
                                        }
                                    }}
                                    placeholder="Amount"
                                    className="w-full h-16 sm:h-20 rounded-xl border border-gray-300 px-3 text-sm text-slate-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:ring-2 focus:ring-teal-700/30 focus:border-teal-700"
                                />
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 mb-6 items-stretch">
                                <div className="text-left order-2 sm:order-1 h-full flex flex-col justify-center">
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Availability</p>
                                    <p className={`text-sm font-bold ${isOpen ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {isOpen ? 'Accepting Bids' : 'Sold Out'}
                                    </p>
                                </div>
                                <div className="text-left order-1 sm:order-2 h-full flex flex-col justify-center">
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Starting Price</p>
                                    <p className="text-lg lg:text-2xl font-semibold text-slate-900">€{product.startingPrice.toFixed(2)}</p>
                                </div>
                            </div>
                        <button
                            type="button"
                            disabled={!isOpen || isPlacingBid}
                            onClick={handlePlaceBid}
                            className={`w-full h-16 rounded-2xl font-semibold text-base transition-all duration-300 border-2 mb-6${
                                isOpen
                                    ? 'bg-teal-700 border-teal-700 text-white hover:bg-teal-950 hover:border-teal-950'
                                    : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            {isOpen ? (isPlacingBid ? 'Placing Bid...' : 'Place Bid') : 'Auction Closed'}
                        </button>
                        {bidError && <p className="-mt-4 mb-6 text-xs text-red-600">{bidError}</p>}
                        </div>
                    </div>
                </div>
        </section>
    );
}


export default Auction;
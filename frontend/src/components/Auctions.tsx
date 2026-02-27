import { useEffect, useState } from "react";
import { ProductCard } from "./ProductCard";
import { auctionsService } from "../services/auctionsService";
import type { Auction } from "../services/auctionsService";

const FALLBACK_IMAGE = "/images/HeroGraphic.png";

export default function AllAuctions() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadAuctions = async () => {
      try {
        const data = await auctionsService.getAuctions();
        if (isMounted) {
          setAuctions(data);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load auctions");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAuctions();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-blue-50/30 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 text-left">
          <h2 className="font-montserrat text-3xl lg:text-4xl font-bold text-gray-800">
            Available <span className="text-teal-700">Auctions</span>
          </h2>
          <p className="text-gray-500 mt-2">Browse all high-stakes private listings.</p>
        </header>

        {isLoading && <p className="text-gray-500 mb-6">Loading auctions...</p>}
        {error && <p className="text-red-500 mb-6">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {auctions.map((item) => (
            <ProductCard 
              key={item.id}
              id={item.id}
              model={item.model}
              serial={item.serial}
              type={item.productType?.name ?? "Unknown Type"}
              image={item.imageObjectKey ?? FALLBACK_IMAGE}
              price={item.startingPrice}
              priceLabel="Starting Price"
              isClosed={item.closed}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
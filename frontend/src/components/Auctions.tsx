import { useEffect, useState } from "react";
import { ProductCard } from "./ProductCard";
import { auctionsService } from "../services/auctionsService";
import type { Auction } from "../services/auctionsService";

const FALLBACK_IMAGE = "/images/HeroGraphic.png";

export default function AllAuctions() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auctionsCsvFile, setAuctionsCsvFile] = useState<File | null>(null);
  const [isUploadingAuctionsCsv, setIsUploadingAuctionsCsv] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const loadAuctions = async () => {
    try {
      setError(null);
      const data = await auctionsService.getAuctions();
      setAuctions(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load auctions");
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadAuctionsOnMount = async () => {
      try {
        const data = await auctionsService.getAuctions();
        if (isMounted) {
          setAuctions(data);
          setError(null);
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

    loadAuctionsOnMount();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAuctionsCsvUpload = async () => {
    if (!auctionsCsvFile) {
      setImportError("Please select a CSV file first.");
      return;
    }

    try {
      setIsUploadingAuctionsCsv(true);
      setImportError(null);
      setImportMessage(null);

      const result = await auctionsService.importAuctionsCsv(auctionsCsvFile);
      setImportMessage(
        `Processed: ${result.processed}, Created: ${result.created}, Updated: ${result.updated}, Failed: ${result.failed}`
      );
      setAuctionsCsvFile(null);
      await loadAuctions();
    } catch (uploadError) {
      setImportError(uploadError instanceof Error ? uploadError.message : "Failed to import auctions CSV");
    } finally {
      setIsUploadingAuctionsCsv(false);
    }
  };

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

        <section className="mt-10 bg-white p-6 rounded-2xl shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-center gap-3 max-w-2xl mx-auto">
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(event) => {
                setAuctionsCsvFile(event.target.files?.[0] ?? null);
                setImportError(null);
                setImportMessage(null);
              }}
              className="block w-full h-12 text-base text-gray-700 border border-gray-300 rounded-md px-3 py-0 leading-12 file:mr-4 file:h-8 file:rounded-md file:border file:border-gray-300 file:bg-transparent file:px-4 file:py-0 file:text-base file:font-medium file:leading-8 file:text-gray-700"
            />
            <button
              type="button"
              onClick={handleAuctionsCsvUpload}
              disabled={isUploadingAuctionsCsv || !auctionsCsvFile}
              className="h-12 bg-teal-700 text-white border border-teal-700 px-8 text-base rounded-md min-w-56 whitespace-nowrap hover:bg-teal-950 hover:border-teal-950 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploadingAuctionsCsv ? "Uploading..." : "Upload Auctions CSV"}
            </button>
          </div>
          {importMessage && <p className="text-green-700 mt-3 text-center max-w-2xl mx-auto">{importMessage}</p>}
          {importError && <p className="text-red-500 mt-3 text-center max-w-2xl mx-auto">{importError}</p>}
        </section>
      </div>
    </div>
  );
}
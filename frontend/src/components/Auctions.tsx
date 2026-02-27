import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "./ProductCard";
import { auctionsService } from "../services/auctionsService";
import type { Auction } from "../services/auctionsService";
import { authService } from "../services/authService";

const FALLBACK_IMAGE = "/images/default-image.png";
const API_BASE_URL = "http://localhost:8080/api";
const AUCTION_GALLERY_STORAGE_KEY = "auction-image-gallery";

const mergeImages = (...imageGroups: (string[] | undefined)[]) => {
  const allImages = imageGroups.flatMap((group) => group ?? []).map((image) => image.trim()).filter((image) => image.length > 0);
  const seen = new Set<string>();
  const merged: string[] = [];

  for (const image of allImages) {
    const dedupeKey = image.split("?")[0];
    if (seen.has(dedupeKey)) {
      continue;
    }

    seen.add(dedupeKey);
    merged.push(image);
  }

  return merged;
};

const getStoredAuctionGallery = (): Record<string, string[]> => {
  try {
    const raw = localStorage.getItem(AUCTION_GALLERY_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as Record<string, string[]>;
    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    return parsed;
  } catch {
    return {};
  }
};

const getAuctionImages = (auction: Auction) => {
  const storedGallery = getStoredAuctionGallery();
  const storedImages = storedGallery[String(auction.id)] ?? [];
  const images = mergeImages([auction.imageUrl ?? ""], storedImages);

  if (images.length === 0) {
    return [FALLBACK_IMAGE];
  }

  return images;
};

export default function AllAuctions() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "open" | "closed">("all");
  const [sortOrder, setSortOrder] = useState<"none" | "lowest" | "highest">("none");
  const [priceMinInput, setPriceMinInput] = useState("");
  const [priceMaxInput, setPriceMaxInput] = useState("");

  const [selectedAuctionIds, setSelectedAuctionIds] = useState<number[]>([]);
  const [isClosingSelected, setIsClosingSelected] = useState(false);
  const [closeMessage, setCloseMessage] = useState<string | null>(null);
  const [closeError, setCloseError] = useState<string | null>(null);

  const [auctionsCsvFile, setAuctionsCsvFile] = useState<File | null>(null);
  const [isUploadingAuctionsCsv, setIsUploadingAuctionsCsv] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const isAdmin = authService.isAdmin();
  const canManageImports = isAdmin;
  const canCloseAuctions = isAdmin;

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

  const availableTypes = useMemo(
    () =>
      Array.from(
        new Set(auctions.map((auction) => auction.productType?.name ?? "Unknown Type"))
      ).sort((a, b) => a.localeCompare(b)),
    [auctions]
  );

  const minAvailablePrice = useMemo(() => {
    if (auctions.length === 0) {
      return 0;
    }

    return Math.floor(Math.min(...auctions.map((auction) => auction.startingPrice)));
  }, [auctions]);

  const maxAvailablePrice = useMemo(() => {
    if (auctions.length === 0) {
      return 0;
    }

    return Math.ceil(Math.max(...auctions.map((auction) => auction.startingPrice)));
  }, [auctions]);

  useEffect(() => {
    if (auctions.length === 0) {
      setPriceMinInput("");
      setPriceMaxInput("");
      return;
    }

    if (!priceMinInput) {
      setPriceMinInput(String(minAvailablePrice));
    }

    if (!priceMaxInput) {
      setPriceMaxInput(String(maxAvailablePrice));
    }
  }, [auctions, minAvailablePrice, maxAvailablePrice, priceMinInput, priceMaxInput]);

  const normalizedMinPrice = useMemo(() => {
    const parsed = Number(priceMinInput);
    if (!Number.isFinite(parsed)) {
      return minAvailablePrice;
    }

    return Math.max(minAvailablePrice, Math.min(parsed, maxAvailablePrice));
  }, [priceMinInput, minAvailablePrice, maxAvailablePrice]);

  const normalizedMaxPrice = useMemo(() => {
    const parsed = Number(priceMaxInput);
    if (!Number.isFinite(parsed)) {
      return maxAvailablePrice;
    }

    return Math.max(minAvailablePrice, Math.min(parsed, maxAvailablePrice));
  }, [priceMaxInput, minAvailablePrice, maxAvailablePrice]);

  const effectiveMinPrice = Math.min(normalizedMinPrice, normalizedMaxPrice);
  const effectiveMaxPrice = Math.max(normalizedMinPrice, normalizedMaxPrice);

  const filteredAuctions = useMemo(() => {
    let filtered = [...auctions];

    if (selectedType !== "all") {
      filtered = filtered.filter(
        (auction) => (auction.productType?.name ?? "Unknown Type") === selectedType
      );
    }

    if (selectedStatus === "open") {
      filtered = filtered.filter((auction) => !auction.closed);
    }

    if (selectedStatus === "closed") {
      filtered = filtered.filter((auction) => auction.closed);
    }

    filtered = filtered.filter(
      (auction) =>
        auction.startingPrice >= effectiveMinPrice && auction.startingPrice <= effectiveMaxPrice
    );

    if (sortOrder === "lowest") {
      filtered.sort((a, b) => a.startingPrice - b.startingPrice);
    }

    if (sortOrder === "highest") {
      filtered.sort((a, b) => b.startingPrice - a.startingPrice);
    }

    return filtered;
  }, [auctions, selectedType, selectedStatus, effectiveMinPrice, effectiveMaxPrice, sortOrder]);

  const selectableVisibleAuctionIds = useMemo(
    () => filteredAuctions.filter((auction) => !auction.closed).map((auction) => auction.id),
    [filteredAuctions]
  );

  const allVisibleSelected =
    selectableVisibleAuctionIds.length > 0 &&
    selectableVisibleAuctionIds.every((id) => selectedAuctionIds.includes(id));

  useEffect(() => {
    setSelectedAuctionIds((currentSelected) =>
      currentSelected.filter((id) => auctions.some((auction) => auction.id === id && !auction.closed))
    );
  }, [auctions]);

  const toggleAuctionSelection = (auctionId: number) => {
    setCloseMessage(null);
    setCloseError(null);

    setSelectedAuctionIds((currentSelected) => {
      if (currentSelected.includes(auctionId)) {
        return currentSelected.filter((id) => id !== auctionId);
      }

      return [...currentSelected, auctionId];
    });
  };

  const toggleSelectAllVisible = () => {
    setCloseMessage(null);
    setCloseError(null);

    if (allVisibleSelected) {
      setSelectedAuctionIds((currentSelected) =>
        currentSelected.filter((id) => !selectableVisibleAuctionIds.includes(id))
      );
      return;
    }

    setSelectedAuctionIds((currentSelected) =>
      Array.from(new Set([...currentSelected, ...selectableVisibleAuctionIds]))
    );
  };

  const handleCloseSelected = async () => {
    if (!canCloseAuctions) {
      setCloseError("You are not allowed to close auctions.");
      return;
    }

    const idsToClose = selectedAuctionIds.filter((id) =>
      auctions.some((auction) => auction.id === id && !auction.closed)
    );

    if (idsToClose.length === 0) {
      setCloseError("Select at least one open auction.");
      return;
    }

    try {
      setIsClosingSelected(true);
      setCloseError(null);
      setCloseMessage(null);

      const failedIds: number[] = [];

      const closeAuctionById = async (auctionId: number) => {
        const token = authService.getToken();
        const response = await fetch(`${API_BASE_URL}/products/${auctionId}/close`, {
          method: "POST",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to close auction");
        }
      };

      for (const id of idsToClose) {
        try {
          await closeAuctionById(id);
        } catch {
          failedIds.push(id);
        }
      }

      await loadAuctions();

      if (failedIds.length > 0) {
        setCloseError(`Failed to close ${failedIds.length} auction(s).`);
      } else {
        setCloseMessage(`Successfully closed ${idsToClose.length} auction(s).`);
      }

      setSelectedAuctionIds([]);
    } finally {
      setIsClosingSelected(false);
    }
  };

  const handleAuctionsCsvUpload = async () => {
    if (!canManageImports) {
      setImportError("You are not allowed to upload auction CSV files.");
      return;
    }

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
    <div className="min-h-screen bg-blue-50/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full">
        <header className="mb-16 text-left w-full">
          <h2 className="font-montserrat text-3xl lg:text-4xl font-bold text-gray-800">
            Available <span className="text-teal-700">Auctions</span>
          </h2>
          <p className="text-gray-500 mt-2">Browse all high-stakes private listings.</p>
        </header>

        <section className="mb-8 bg-white p-4 rounded-2xl shadow-md w-full">
          <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
            <div className="flex flex-wrap items-end justify-center gap-4 sm:gap-6 w-full">
              <div className="flex flex-col items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Type</label>
                <select
                  value={selectedType}
                  onChange={(event) => setSelectedType(event.target.value)}
                  className="h-9 border border-gray-300 rounded-md px-3 text-sm min-w-28 text-gray-700"
                >
                  <option value="all">All</option>
                  {availableTypes.map((typeName) => (
                    <option key={typeName} value={typeName}>
                      {typeName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(event) =>
                    setSelectedStatus(event.target.value as "all" | "open" | "closed")
                  }
                  className="h-9 border border-gray-300 rounded-md px-3 text-sm min-w-28 text-gray-700"
                >
                  <option value="all">All</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="flex flex-col items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Price range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={minAvailablePrice}
                    max={maxAvailablePrice}
                    value={priceMinInput}
                    onChange={(event) => setPriceMinInput(event.target.value)}
                    className="h-9 w-24 border border-gray-300 rounded-md px-2 text-sm text-gray-700"
                    placeholder="Min price"
                  />
                  <span className="text-sm text-gray-500">to</span>
                  <input
                    type="number"
                    min={minAvailablePrice}
                    max={maxAvailablePrice}
                    value={priceMaxInput}
                    onChange={(event) => setPriceMaxInput(event.target.value)}
                    className="h-9 w-24 border border-gray-300 rounded-md px-2 text-sm text-gray-700"
                    placeholder="Max price"
                  />
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Sorting</label>
                <select
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value as "none" | "lowest" | "highest")}
                  className="h-12 border border-gray-300 rounded-md px-3 text-sm min-w-36 text-gray-700"
                >
                  <option value="none">None</option>
                  <option value="highest">Highest Price</option>
                  <option value="lowest">Lowest Price</option>
                </select>
              </div>
            </div>

          </div>
        </section>

        {canCloseAuctions && (
          <section className="mb-8 w-full">
            <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <label className="inline-flex items-center gap-3 text-base font-medium text-gray-700 select-none px-4">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAllVisible}
                  disabled={selectableVisibleAuctionIds.length === 0}
                  className="h-5 w-5 rounded border-gray-300 text-teal-700 focus:ring-teal-700"
                />
                Select all
              </label>
              <button
                type="button"
                onClick={handleCloseSelected}
                disabled={isClosingSelected || selectedAuctionIds.length === 0}
                className="h-11 w-full sm:w-auto bg-teal-700 text-white border border-teal-700 px-6 text-base rounded-md whitespace-nowrap hover:bg-teal-950 hover:border-teal-950 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isClosingSelected ? "Closing..." : "Close Selected Auctions"}
              </button>
            </div>

            {closeMessage && <p className="text-green-700 mt-3 text-left sm:text-right">{closeMessage}</p>}
            {closeError && <p className="text-red-600 mt-3 text-left sm:text-right">{closeError}</p>}
          </section>
        )}

        {isLoading && <p className="text-gray-500 mb-6">Loading auctions...</p>}
        {error && <p className="text-red-500 mb-6">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {filteredAuctions.map((item) => (
            <div key={item.id} className="relative">
              {(() => {
                const selectedImage = getAuctionImages(item)[0] ?? FALLBACK_IMAGE;

                return (
                  <>
              <ProductCard
                id={item.id}
                model={item.model}
                serial={item.serial}
                type={item.productType?.name ?? "Unknown Type"}
                image={selectedImage}
                price={item.startingPrice}
                priceLabel="Starting Price"
                isClosed={item.closed}
              />
                  </>
                );
              })()}
              {canCloseAuctions && !item.closed && (
                <label
                  className="absolute top-11 left-3 z-30 inline-flex items-center justify-center h-6 w-6 rounded-md bg-white/95 border border-gray-300 shadow-sm cursor-pointer"
                  onClick={(event) => event.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selectedAuctionIds.includes(item.id)}
                    onChange={() => toggleAuctionSelection(item.id)}
                    className="h-4 w-4 rounded border-gray-300 text-teal-700 focus:ring-teal-700"
                  />
                </label>
              )}
            </div>
          ))}
        </div>

        {!isLoading && filteredAuctions.length === 0 && (
          <p className="text-gray-500 mt-6">No auctions match the selected filters.</p>
        )}

        {canManageImports && (
          <section className="mt-10 bg-white p-6 rounded-2xl shadow-md w-full">
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
                className="h-12 w-full sm:w-auto bg-teal-700 text-white border border-teal-700 px-8 text-base rounded-md sm:min-w-56 whitespace-nowrap hover:bg-teal-950 hover:border-teal-950 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploadingAuctionsCsv ? "Uploading..." : "Upload Auctions CSV"}
              </button>
            </div>
            {importMessage && <p className="text-green-700 mt-3 text-center max-w-2xl mx-auto">{importMessage}</p>}
            {importError && <p className="text-red-500 mt-3 text-center max-w-2xl mx-auto">{importError}</p>}
          </section>
        )}
      </div>
    </div>
  );
}
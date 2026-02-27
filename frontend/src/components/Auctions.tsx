import { ProductCard } from "./ProductCard";
import { MOCK_PRODUCTS, MOCK_TYPES } from "../data/mock_data";

export default function AllAuctions() {
  const auctions = MOCK_PRODUCTS;
  const typeById = new Map(MOCK_TYPES.map((type) => [type.id, type.name]));

  return (
    <div className="min-h-screen bg-blue-50/30 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 text-left">
          <h2 className="font-montserrat text-3xl lg:text-4xl font-bold text-gray-800">
            Available <span className="text-teal-700">Auctions</span>
          </h2>
          <p className="text-gray-500 mt-2">Browse all high-stakes private listings.</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {auctions.map((item) => (
            <ProductCard 
              key={item.id}
              id={item.id}
              model={item.model}
              serial={item.serial}
              type={typeById.get(item.type_id) ?? "Unknown Type"}
              image={item.images[0]}
              price={item.basePrice}
              priceLabel="Starting Price"
              isClosed={item.is_closed}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
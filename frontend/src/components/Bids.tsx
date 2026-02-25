import { ProductCard } from "../components/ProductCard";
import { MOCK_BIDS, MOCK_PRODUCTS, MOCK_TYPES } from "../data/mock_data";

export default function YourBids() {
  const productsById = new Map(MOCK_PRODUCTS.map((product) => [product.id, product]));
  const typeById = new Map(MOCK_TYPES.map((type) => [type.id, type.name]));

  const myBids = MOCK_BIDS.map((bid) => {
    const product = productsById.get(bid.product_id);

    if (!product) {
      return null;
    }

    return {
      ...product,
      bidId: bid.id,
      bidPrice: bid.bid_price
    };
  }).filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <div className="min-h-screen bg-blue-50/30 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 text-left">
          <h2 className="font-montserrat text-3xl lg:text-4xl font-bold text-gray-800">
            Your <span className="text-teal-700">Active Bids</span>
          </h2>
          <p className="text-gray-500 mt-2">Track the status of your blind offers.</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-10">
          {myBids.map((item) => (
            <ProductCard 
              key={item.bidId}
              id={item.id}
              model={item.model}
              serial={item.serial}
              type={typeById.get(item.type_id) ?? "Unknown Type"}
              image={item.images[0]}
              price={item.bidPrice}
              priceLabel="Your Offer"
              isClosed={item.is_closed}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
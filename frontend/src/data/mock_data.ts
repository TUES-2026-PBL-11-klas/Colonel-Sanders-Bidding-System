export const MOCK_PRODUCTS = [
  {
    id: 1,
    model: "Eames Lounge Chair & Ottoman Special Edition",
    type_id: 1,
    serial: "HML-90210-EV",
    description: "An original 1956 design features black top-grain leather and a walnut veneer shell. This special edition includes a polished chrome base.",
    basePrice: 4200.00,
    is_closed: false,
    images: ["/images/HeroGraphic.png"]
  },
  {
    id: 2,
    model: "Mac Studio M2 Ultra & Studio Display",
    type_id: 2,
    serial: "APL-MS-M2U",
    description: "High-performance workstation configuration. 24-core CPU and 76-core GPU. Decommissioned from creative department.",
    basePrice: 3999.99,
    is_closed: false,
    images: ["/images/HeroGraphic.png"]
  },
  {
    id: 3,
    model: "Leica M11 Mirrorless Camera",
    type_id: 3,
    serial: "LCA-M11-BLK",
    description: "60MP full-frame BSI CMOS sensor with Triple Resolution technology. Includes Summilux-M 35mm f/1.4 ASPH lens.",
    basePrice: 8900.00,
    is_closed: true,
    images: ["/images/HeroGraphic.png"]
  },
  {
    id: 4,
    model: "Herman Miller Aeron Chair - Onyx",
    type_id: 1,
    serial: "HML-AER-2024",
    description: "Fully loaded remastered Aeron in Onyx Ultra-Matte. Features PostureFit SL and multi-surface casters with quiet roll.",
    basePrice: 1250.00,
    is_closed: false,
    images: ["/images/HeroGraphic.png"]
  },
  {
    id: 5,
    model: "Sony Venice 2 8K Cinema Camera",
    type_id: 3,
    serial: "SNY-V2-8K",
    description: "Full-frame cinema camera with 8.6K sensor, internal X-OCN recording, and 16 stops of dynamic range.",
    basePrice: 48000.00,
    is_closed: false,
    images: ["/images/HeroGraphic.png"]
  },
  {
    id: 6,
    model: "Ubiquiti Dream Machine SE Rack",
    type_id: 2,
    serial: "UBQ-UDM-SE",
    description: "Enterprise-grade UniFi OS Console with 10G SFP+ and 2.5GbE RJ45 ports. Integrated 128 GB SSD.",
    basePrice: 499.00,
    is_closed: true,
    images: ["/images/HeroGraphic.png"]
  },
  {
    id: 7,
    model: "USM Haller Sideboard - Pure White",
    type_id: 1,
    serial: "USM-HLR-WHT",
    description: "Modular steel furniture classic. Configured with four drop-down doors and chrome frame.",
    basePrice: 2150.00,
    is_closed: false,
    images: ["/images/HeroGraphic.png", "/images/HeroGraphic.png", "/images/HeroGraphic.png"]
  },
  {
    id: 8,
    model: "Apple Pro Display XDR",
    type_id: 2,
    serial: "APL-XDR-NAN",
    description: "32-inch Retina 6K display with Nano-texture glass. 1600 nits peak brightness and P3 wide color gamut.",
    basePrice: 5999.00,
    is_closed: false,
    images: ["/images/HeroGraphic.png", "/images/HeroGraphic.png"]
  }
];

export const MOCK_TYPES = [
  { id: 1, name: "Premium Furniture" },
  { id: 2, name: "IT Infrastructure" },
  { id: 3, name: "Photography" }
];

export const MOCK_BIDS = [
  { id: 3, product_id: 3, bid_price: 9200.00, bidder_id: 1 },
  { id: 6, product_id: 6, bid_price: 520.00, bidder_id: 1 },
  { id: 7, product_id: 7, bid_price: 2300.00, bidder_id: 1 },
];
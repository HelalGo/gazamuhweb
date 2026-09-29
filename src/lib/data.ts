export type Product = {
  id: string;
  slug: string;
  sku: string | null;
  name: string;
  brand: string;
  category: string;
  productGroup: string | null;
  price: number;
  oldPrice: number | null;
  inStock: boolean;
  description: string;
  specs: Record<string, string>;
  imageUrl: string | null;
};

// Veritabanı ve data/products.json yokken kullanılan örnek ürünler.
export const sampleProducts: Product[] = [
  {
    id: "1", slug: "ornek-inverter-split-klima-12000-btu", sku: "ORNEK-1", name: "Örnek Inverter Split Klima 12.000 BTU",
    brand: "Örnek Marka", category: "Klima", productGroup: "Split Klima", price: 24990, oldPrice: 27990, inStock: true,
    description: "Örnek ürün açıklaması.", specs: { Kapasite: "12.000 BTU", "Enerji Sınıfı": "A++" }, imageUrl: null,
  },
];

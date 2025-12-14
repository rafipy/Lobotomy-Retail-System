"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getProducts, Product } from "@/lib/api/products";
import { Loader2, ShoppingCart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/app/components/dashboard/cart";
import { setCheckoutItems } from "@/lib/api/checkout";

interface CustomerItemGalleryProps {
  searchQuery?: string;
}

export function CustomerItemGallery({ searchQuery = "" }: CustomerItemGalleryProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const { addToCart } = useCart();
  
  function getCustomerStockStatus(stock: number) {
    if (stock === 0) {
      return {
        text: "OUT OF STOCK",
        className: "text-red-500 bg-red-950/50 border-red-600",
      };
    } else if (stock < 50) {
      return {
        text: "ALMOST OUT OF STOCK",
        className: "text-yellow-400 bg-yellow-950/50 border-yellow-600",
      };
    } else {
      return {
        text: "IN STOCK",
        className: "text-teal-400 bg-teal-950/50 border-teal-600",
      };
    }
  }

  // Handle Buy Now - goes directly to checkout with single item
  const handleBuyNow = (product: Product) => {
    // Set checkout items with just this one product
    setCheckoutItems([{ product, quantity: 1 }]);
    // Flag that this checkout is NOT from cart (single item purchase)
    localStorage.setItem("checkout_from_cart", "false");
    router.push("/customer/checkout");
  };

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const data = await getProducts();
        setProducts(data);
        setError(null);
      } catch (err) {
        setError("Failed to load products. Is the backend running?");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Extract unique categories
  const categories = ["All", ...new Set(products.map((item) => item.category))];

  // Filter by category and search query
  const filteredItems = products.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
        <span className="ml-3 text-gray-400">Loading products...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 text-red-400 border-2 border-red-500 rounded-xl bg-red-950/20">
        <p className="text-xl font-body">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in">
      {/* Search Results Count */}
      {searchQuery && (
        <p className="mb-4 text-sm text-gray-400">
          Found {filteredItems.length} result{filteredItems.length !== 1 ? "s" : ""} for "{searchQuery}"
        </p>
      )}

      {/* Category Filter */}
      <div className="mb-8 flex flex-wrap gap-3">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 border-2 ${
              selectedCategory === category
                ? "bg-teal-700 text-white border-teal-500"
                : "bg-black/40 text-teal-300 border-teal-600 hover:bg-teal-900/50 hover:border-teal-400"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => {
          const stockStatus = getCustomerStockStatus(item.stock);
          const isOutOfStock = item.stock === 0;

          return (
            <div
              key={item.id}
              className="bg-black/60 border-2 border-teal-500 rounded-xl overflow-hidden backdrop-blur-sm hover:border-teal-300 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/50 flex flex-col"
            >
              {/* Image Container */}
              <div className="relative h-48 bg-gray-900 border-b-2 border-teal-500">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : null}
                <div
                  className={`absolute inset-0 flex items-center justify-center text-gray-500 ${item.image_url ? "hidden" : ""}`}
                >
                  <div className="text-center p-4">
                    <div className="text-6xl mb-2">📦</div>
                    <span className="text-sm">No Image</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-xl font-heading font-bold text-teal-200 mb-2">
                  {item.name}
                </h3>

                <p className="text-sm text-gray-300 mb-3 flex-1 font-body">
                  {item.description}
                </p>

                <div className="space-y-2">
                  {/* Price */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-body">Price:</span>
                    <span className="text-xl font-bold text-yellow-400">
                      ${item.selling_price.toFixed(2)}
                    </span>
                  </div>

                  {/* Stock Status */}
                  <div
                    className={`text-center py-2 px-3 rounded-lg border-2 font-bold text-sm ${stockStatus.className}`}
                  >
                    {stockStatus.text}
                  </div>

                  {/* Add to Cart Button and Buy Now button */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => addToCart(item)}
                      disabled={isOutOfStock}
                      className={`font-bold text-sm py-2 ${
                        isOutOfStock
                          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : "bg-yellow-500 hover:bg-yellow-600 text-black"
                      }`}
                    >
                      <ShoppingCart className="mr-1 h-4 w-4" />
                      Add to Cart
                    </Button>

                    <Button
                      onClick={() => handleBuyNow(item)}
                      disabled={isOutOfStock}
                      className={`font-bold text-sm py-2 ${
                        isOutOfStock
                          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : "bg-teal-600 hover:bg-teal-700 text-white"
                      }`}
                    >
                      <Zap className="mr-1 h-4 w-4" />
                      Buy Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-xl font-body">
            {searchQuery 
              ? `No products found matching "${searchQuery}"`
              : "No items found in this category."}
          </p>
        </div>
      )}
    </div>
  );
}

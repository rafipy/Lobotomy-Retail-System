"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getProducts, Product } from "@/lib/api/products";
import { Loader2, ShoppingBag, LogOut, Menu, ShoppingCart } from "lucide-react";
import { getStockStatus } from "@/lib/stock-status";
import { clearAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useCart, CartDropdown } from "@/app/components/dashboard/cart";

interface CustomerHeaderProps {
  username: string;
  onMenuClick: () => void;
}

export function CustomerHeader({ username, onMenuClick }: CustomerHeaderProps) {
  const router = useRouter();
  const { getTotalItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    router.push("/");
  };
  
  const totalItems = getTotalItems();

  return (
    <header className="border-b-4 border-teal-500 bg-black/80 backdrop-blur-sm sticky top-0 z-30 w-full animate-fade-in">
      <div className="w-full px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-c gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="text-teal-200 hover:bg-transparent border-2 hover:text-white border-teal-500/50 hover:border-teal-400"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-3xl font-heading font-bold text-teal-200">
                Welcome to L. Corp Store
              </h1>
              <p className="text-gray-400 font-body mt-1">
                Hello,{" "}
                <span className="text-teal-400 font-semibold">{username}</span>
              </p>
            </div>
          </div>
        </div>
          <div className="flex justify-end items-center gap-3 relative">
                   {/* Cart Button */}
                   <Button
                     onClick={() => setIsCartOpen(!isCartOpen)}
                     className="bg-teal-700 hover:bg-teal-900 text-white font-bold relative"
                   >
                     <ShoppingCart className="h-5 w-5" />
                     {totalItems > 0 && (
                       <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                         {totalItems}
                       </span>
                     )}
                   </Button>
       
                   {/* Cart Dropdown */}
                   <CartDropdown isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
          <Button
            onClick={handleLogout}
            className="bg-teal-700 hover:bg-teal-900 text-white font-bold"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}

function CustomerItemGallery() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

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

  const filteredItems =
    selectedCategory === "All"
      ? products
      : products.filter((item) => item.category === selectedCategory);

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
          const stockStatus = getStockStatus(item.stock);

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

                  {/* Category Badge */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="bg-gray-800 text-gray-400 px-3 py-1 rounded-full border border-gray-600">
                      {item.category}
                    </span>
                    <span className="text-gray-500">ID: #{item.id}</span>
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
          <p className="text-xl font-body">No items found in this category.</p>
        </div>
      )}
    </div>
  );
}

export function CustomerDashboard() {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8 animate-fade-in">
      <div className="bg-black/40 border-2 border-teal-500 rounded-xl p-6 backdrop-blur-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-heading font-bold text-teal-200 mb-2 flex items-center gap-2">
            <ShoppingBag className="h-6 w-6" />
            Browse Products
          </h2>
          <p className="text-gray-400 font-body">
            Explore our collection of available products
          </p>
        </div>

        <CustomerItemGallery />
      </div>
    </div>
  );
}

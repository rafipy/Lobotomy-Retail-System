"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getProducts, Product } from "@/lib/api/products";
import { Loader2 } from "lucide-react";
import { getStockStatus } from "@/lib/stock-status";
import { EditProductDialog } from "@/app/components/inventory/edit-product-dialog";

export function ItemGallery() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

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

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setEditDialogOpen(true);
  };

  const handleProductUpdated = () => {
    fetchProducts();
    setEditDialogOpen(false);
    setSelectedProduct(null);
  };

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
                ? "bg-red-700 text-white border-red-500"
                : "bg-black/40 text-teal-300 border-teal-600 hover:bg-red-900/50 hover:border-red-500"
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
              onClick={() => handleProductClick(item)}
              className="bg-black/60 border-2 border-red-500 rounded-xl overflow-hidden backdrop-blur-sm hover:border-teal-400 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/50 flex flex-col cursor-pointer"
            >
              {/* Image Container */}
              <div className="relative h-48 bg-gray-900 border-b-2 border-red-500">
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

      {/* Edit Product Dialog */}
      {selectedProduct && (
        <EditProductDialog
          product={selectedProduct}
          onProductUpdated={handleProductUpdated}
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) setSelectedProduct(null);
          }}
          showTrigger={false}
        />
      )}
    </div>
  );
}

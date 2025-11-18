"use client";

import Image from "next/image";
import { useState } from "react";

export interface ItemData {
  id: number;
  name: string;
  description: string;
  stock: number;
  price: number;
  imageUrl: string;
  category: string;
}

interface ItemGalleryProps {
  items?: ItemData[];
}

// Dummy data for now
const DUMMY_ITEMS: ItemData[] = [
  {
    id: 1,
    name: "L. CORP Energy Drink",
    description:
      "Official L. CORP branded energy drink. Side effects may include: enhanced productivity, mild paranoia.",
    stock: 247,
    price: 4.99,
    imageUrl: "/placeholder-energy-drink.jpg",
    category: "Beverages",
  },
  {
    id: 2,
    name: "Emergency Ration Pack",
    description:
      "Standard issue rations for extended shifts. Nutritionally complete. Taste not guaranteed.",
    stock: 156,
    price: 12.99,
    imageUrl: "/placeholder-ration.jpg",
    category: "Food",
  },
  {
    id: 3,
    name: "L. CORP Safety Helmet",
    description:
      "Regulation safety equipment. Protects against falling objects and minor anomalies.",
    stock: 89,
    price: 45.0,
    imageUrl: "/placeholder-helmet.jpg",
    category: "Safety Equipment",
  },
  {
    id: 4,
    name: "Employee ID Badge",
    description:
      "Official identification badge. Required for all facility access. Do not lose.",
    stock: 342,
    price: 5.0,
    imageUrl: "/placeholder-badge.jpg",
    category: "Accessories",
  },
  {
    id: 5,
    name: "Flashlight (Heavy Duty)",
    description:
      "Industrial-grade flashlight. Essential for navigating dark sectors. Battery life: 72 hours.",
    stock: 23,
    price: 29.99,
    imageUrl: "/placeholder-flashlight.jpg",
    category: "Tools",
  },
  {
    id: 6,
    name: "First Aid Kit",
    description:
      "Comprehensive medical supplies. For minor injuries only. Major injuries require medical bay.",
    stock: 67,
    price: 34.5,
    imageUrl: "/placeholder-firstaid.jpg",
    category: "Medical",
  },
  {
    id: 7,
    name: "Maintenance Manual",
    description:
      "Complete maintenance procedures. Updated quarterly. Read before operating equipment.",
    stock: 12,
    price: 19.99,
    imageUrl: "/placeholder-manual.jpg",
    category: "Documentation",
  },
  {
    id: 8,
    name: "Coffee (Premium Blend)",
    description:
      "High-quality coffee beans. Sourced from K Corp. Keeps you alert during night shifts.",
    stock: 198,
    price: 15.99,
    imageUrl: "/placeholder-coffee.jpg",
    category: "Beverages",
  },
];

export function ItemGallery({ items = DUMMY_ITEMS }: ItemGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Extract unique categories
  const categories = ["All", ...new Set(items.map((item) => item.category))];

  const filteredItems =
    selectedCategory === "All"
      ? items
      : items.filter((item) => item.category === selectedCategory);

  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return {
        text: "OUT OF STOCK",
        color: "text-red-600 bg-red-950/50 border-red-600",
      };
    } else if (stock < 50) {
      return {
        text: `LOW STOCK: ${stock}`,
        color: "text-yellow-400 bg-yellow-950/50 border-yellow-600",
      };
    } else {
      return {
        text: `IN STOCK: ${stock}`,
        color: "text-teal-400 bg-teal-950/50 border-teal-600",
      };
    }
  };

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
              className="bg-black/60 border-2 border-red-500 rounded-xl overflow-hidden backdrop-blur-sm hover:border-teal-400 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/50 flex flex-col"
            >
              {/* Image Container */}
              <div className="relative h-48 bg-gray-900 border-b-2 border-red-500">
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  <div className="text-center p-4">
                    <div className="text-6xl mb-2">📦</div>
                    <span className="text-sm">Image Placeholder</span>
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
                      ${item.price.toFixed(2)}
                    </span>
                  </div>

                  {/* Stock Status */}
                  <div
                    className={`text-center py-2 px-3 rounded-lg border-2 font-bold text-sm ${stockStatus.color}`}
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

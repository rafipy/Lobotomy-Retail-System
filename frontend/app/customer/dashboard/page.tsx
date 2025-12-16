"use client";

import { useState } from "react";
import { CustomerItemGallery } from "@/app/components/dashboard/customer-item-gallery";
import { ShoppingBag, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AuthRedirect } from "@/app/components/auth/auth-redirect";

export default function CustomerDashboard() {
  const [searchQuery, setSearchQuery] = useState("");

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <AuthRedirect requiredRole="CUSTOMER">
      <div className="w-full max-w-7xl mx-auto px-6 py-8 animate-fade-in">
        <div className="bg-black/40 border-2 border-teal-500 rounded-xl p-6 backdrop-blur-sm">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-heading font-bold text-teal-200 mb-2 flex items-center gap-2">
                <ShoppingBag className="h-6 w-6" />
                Browse Products
              </h2>
              <p className="text-gray-400 font-body">
                Explore our collection of available products
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 py-2 bg-black/50 border-2 border-teal-600 text-white placeholder:text-gray-500 focus:border-teal-400 rounded-lg"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          <CustomerItemGallery searchQuery={searchQuery} />
        </div>
      </div>
    </AuthRedirect>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Search,
  Loader2,
  Eye,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  phone_number: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  birth_date: string | null;
  username: string | null;
  created_at: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/customers");
      if (!response.ok) throw new Error("Failed to fetch customers");
      const data = await response.json();
      setCustomers(data);
      setError(null);
    } catch (err) {
      setError(
        "Failed to load customers. Please check the backend connection.",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const query = searchQuery.toLowerCase();
    return (
      customer.first_name.toLowerCase().includes(query) ||
      customer.last_name.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.phone_number?.toLowerCase().includes(query) ||
      customer.username?.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
          <span className="ml-3 text-gray-400">Loading customers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8 animate-fade-in">
      <div className="bg-black/40 border-2 border-red-500 rounded-xl p-6 backdrop-blur-sm">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-heading font-bold text-teal-200 mb-2 flex items-center gap-2">
            <User className="h-6 w-6" />
            Customer Management
          </h2>
          <p className="text-gray-400 font-body">
            View and manage all registered customers
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-black/50 border-2 border-teal-600 text-white placeholder:text-gray-500 focus:border-teal-400"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-900/30 border-2 border-red-500 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Customer Cards */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-8 text-gray-400 bg-black/60 border border-teal-500/30 rounded-lg">
              {searchQuery
                ? `No customers found matching "${searchQuery}"`
                : "No customers found"}
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="bg-black/60 border-2 border-teal-500/50 rounded-lg p-4 hover:border-teal-400 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 font-mono">
                        #{customer.id}
                      </span>
                      <h3 className="text-lg font-semibold text-white">
                        {customer.first_name} {customer.last_name}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                      {customer.username && (
                        <div className="flex items-center gap-2 text-gray-300">
                          <User className="h-4 w-4 text-gray-400" />
                          <span>{customer.username}</span>
                        </div>
                      )}
                      {customer.email && (
                        <div className="flex items-center gap-2 text-gray-300">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="truncate">{customer.email}</span>
                        </div>
                      )}
                      {customer.phone_number && (
                        <div className="flex items-center gap-2 text-gray-300">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{customer.phone_number}</span>
                        </div>
                      )}
                      {customer.city && (
                        <div className="flex items-center gap-2 text-gray-300">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{customer.city}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-gray-500">
                      Joined: {formatDate(customer.created_at)}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => setSelectedCustomer(customer)}
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-black/95 border-2 border-teal-500 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-black/95 border-b border-teal-500/50 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-heading text-teal-200">
                Customer Details
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-400 hover:text-white hover:bg-teal-900/50"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="bg-black/60 border border-teal-500/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-teal-200 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Customer ID</p>
                    <p className="text-white font-mono">
                      #{selectedCustomer.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Username</p>
                    <p className="text-white">
                      {selectedCustomer.username || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">First Name</p>
                    <p className="text-white">{selectedCustomer.first_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Last Name</p>
                    <p className="text-white">{selectedCustomer.last_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Birth Date</p>
                    <p className="text-white">
                      {formatDate(selectedCustomer.birth_date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Member Since</p>
                    <p className="text-white">
                      {formatDate(selectedCustomer.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-black/60 border border-teal-500/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-teal-200 mb-4 flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-400 text-sm">Email</p>
                      <p className="text-white">
                        {selectedCustomer.email || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-400 text-sm">Phone Number</p>
                      <p className="text-white">
                        {selectedCustomer.phone_number || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Info */}
              <div className="bg-black/60 border border-teal-500/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-teal-200 mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address Information
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-gray-400 text-sm">Street Address</p>
                    <p className="text-white">
                      {selectedCustomer.address || "Not provided"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">City</p>
                      <p className="text-white">
                        {selectedCustomer.city || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Postal Code</p>
                      <p className="text-white">
                        {selectedCustomer.postal_code || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

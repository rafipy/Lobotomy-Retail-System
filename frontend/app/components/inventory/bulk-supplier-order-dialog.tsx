"use client";

import { useState } from "react";
import { Loader2, PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createBulkSupplierOrder } from "@/lib/api/supplier-orders";
import { Product } from "@/lib/api/products";

interface BulkSupplierOrderDialogProps {
  products: Product[];
  onOrderCreated: () => void;
}

export function BulkSupplierOrderDialog({
  products,
  onOrderCreated,
}: BulkSupplierOrderDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter to only low stock items (using each product's reorder_level)
  const lowStockProducts = products.filter((p) => p.stock < p.reorder_level);

  // Track quantities for each product (initialized with their reorder_amount)
  const [quantities, setQuantities] = useState<Record<number, number>>(() => {
    const initial: Record<number, number> = {};
    lowStockProducts.forEach((p) => {
      initial[p.id] = p.reorder_amount;
    });
    return initial;
  });

  // Reset quantities when dialog opens
  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen) {
      const initial: Record<number, number> = {};
      lowStockProducts.forEach((p) => {
        initial[p.id] = p.reorder_amount;
      });
      setQuantities(initial);
      setError(null);
    }
  }

  function updateQuantity(productId: number, value: number) {
    setQuantities((prev) => ({
      ...prev,
      [productId]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const items = lowStockProducts
      .filter((p) => quantities[p.id] > 0)
      .map((p) => ({
        product_id: p.id,
        quantity: quantities[p.id],
      }));

    if (items.length === 0) {
      setError("Please enter quantities for at least one product");
      return;
    }

    try {
      setLoading(true);
      await createBulkSupplierOrder({ items });

      setOpen(false);
      onOrderCreated();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create bulk supplier order",
      );
    } finally {
      setLoading(false);
    }
  }

  const totalCost = lowStockProducts.reduce((sum, p) => {
    return sum + (quantities[p.id] || 0) * p.purchase_price;
  }, 0);

  if (lowStockProducts.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold border-2 border-yellow-400 shadow-lg shadow-yellow-500/20">
          <PackagePlus className="mr-2 h-4 w-4" />
          Bulk Supplier Order ({lowStockProducts.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-4 border-yellow-500 text-white max-w-3xl w-[95vw] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading text-yellow-400">
            Bulk Supplier Order
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Order stock for all low-stock items (below their reorder level)
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 mt-4 flex-1 flex flex-col min-h-0"
        >
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Product List */}
          <div className="space-y-3 flex-1 overflow-y-auto gap-2 pr-2">
            {lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="bg-black/40 border-2 border-gray-700 rounded-lg p-4 flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-teal-200 font-semibold ">
                    {product.name}
                  </h4>
                  <div className="flex gap-4 text-xs text-gray-400">
                    <span>
                      Stock:{" "}
                      <span className="text-red-400">{product.stock}</span>
                      <span className="text-gray-500">
                        {" "}
                        / {product.reorder_level} min
                      </span>
                    </span>
                    <span>Supplier: {product.supplier_name}</span>
                    <span>${product.purchase_price.toFixed(2)}/unit</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min="0"
                    value={quantities[product.id] || 0}
                    onChange={(e) =>
                      updateQuantity(product.id, parseInt(e.target.value) || 0)
                    }
                    className="w-24 bg-black/60 border-2 border-gray-600 text-white focus:border-yellow-400"
                  />
                  <span className="text-gray-500 text-sm w-20 text-right">
                    $
                    {(
                      (quantities[product.id] || 0) * product.purchase_price
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Order Total */}
          <div className="bg-yellow-900/20 border-2 border-yellow-600 rounded-lg p-4 flex-shrink-0">
            <div className="flex justify-between">
              <span className="text-yellow-200 font-semibold">
                Total Order Cost:
              </span>
              <span className="text-yellow-400 font-bold text-xl">
                ${totalCost.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {lowStockProducts.filter((p) => quantities[p.id] > 0).length}{" "}
              products selected
            </p>
          </div>

          <DialogFooter className="mt-6 flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-yellow-600 hover:bg-yellow-700 text-white border-2 border-yellow-400"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ordering...
                </>
              ) : (
                <>
                  <PackagePlus className="mr-2 h-4 w-4" />
                  Place Bulk Order
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

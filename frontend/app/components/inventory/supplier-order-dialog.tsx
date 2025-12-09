"use client";

import { useState } from "react";
import { Loader2, PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createSupplierOrder } from "@/lib/api/supplier-orders";
import { Product } from "@/lib/api/products";

interface SupplierOrderDialogProps {
  product: Product;
  onOrderCreated: () => void;
}

export function SupplierOrderDialog({
  product,
  onOrderCreated,
}: SupplierOrderDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(100);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (quantity <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }

    try {
      setLoading(true);
      await createSupplierOrder({
        product_id: product.id,
        quantity: quantity,
      });

      setOpen(false);
      setQuantity(100);
      onOrderCreated();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create supplier order",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/30"
        >
          <PackagePlus className="h-4 w-4 mr-1" />
          Order
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-2 border-yellow-500 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading text-yellow-400">
            Order from Supplier
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Order more stock for &quot;{product.name}&quot; from{" "}
            {product.supplier_name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Current Stock Info */}
          <div className="bg-black/40 border border-gray-700 rounded-lg p-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Current Stock:</span>
              <span className="text-red-400 font-bold">
                {product.stock} units
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-400">Purchase Price:</span>
              <span className="text-gray-300">
                ${product.purchase_price.toFixed(2)} / unit
              </span>
            </div>
          </div>

          {/* Quantity Input */}
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-gray-300">
              Quantity to Order <span className="text-red-500">*</span>
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="bg-black/60 border-gray-600 text-white focus:border-yellow-400"
            />
          </div>

          {/* Order Total */}
          <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-3">
            <div className="flex justify-between text-sm">
              <span className="text-yellow-200">Order Total:</span>
              <span className="text-yellow-400 font-bold">
                ${(quantity * product.purchase_price).toFixed(2)}
              </span>
            </div>
          </div>

          <DialogFooter className="mt-6">
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
                  Place Order
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

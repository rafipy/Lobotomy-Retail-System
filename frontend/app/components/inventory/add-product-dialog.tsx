"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createProduct, ProductCreate } from "@/lib/api/products";
import { getActiveSuppliers, SupplierBrief } from "@/lib/api/supplier";

interface AddProductDialogProps {
  onProductAdded: () => void;
}

const CATEGORIES = [
  "Abnormalities / E.G.O",
  "Beverages",
  "Food",
  "Safety Equipment",
  "Accessories",
  "Tools",
  "Medical",
  "Documentation",
  "Services",
  "Electronics",
  "Miscellaneous",
];

const initialFormData: ProductCreate = {
  name: "",
  description: "",
  selling_price: 0,
  purchase_price: 0,
  supplier_id: 0,
  stock: 0,
  reorder_level: 50,
  reorder_amount: 100,
  category: "",
  image_url: "",
};

export function AddProductDialog({ onProductAdded }: AddProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<SupplierBrief[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductCreate>(initialFormData);

  useEffect(() => {
    if (open) {
      fetchSuppliers();
    }
  }, [open]);

  async function fetchSuppliers() {
    try {
      setLoadingSuppliers(true);
      const data = await getActiveSuppliers();
      setSuppliers(data);
    } catch (err) {
      console.error("Failed to load suppliers:", err);
      setError("Failed to load suppliers. Please try again.");
    } finally {
      setLoadingSuppliers(false);
    }
  }

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  }

  function handleSelectChange(name: string, value: string) {
    setFormData((prev) => ({
      ...prev,
      [name]: name === "supplier_id" ? parseInt(value) : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      await createProduct({
        ...formData,
        description: formData.description || null,
        image_url: formData.image_url || null,
      });

      setFormData(initialFormData);
      setOpen(false);
      onProductAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setLoading(false);
    }
  }

  const selectedSupplier = suppliers.find((s) => s.id === formData.supplier_id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-teal-600 hover:bg-teal-700 text-white font-bold border-2 border-teal-400 shadow-lg shadow-teal-500/20">
          <Plus className="mr-2 h-4 w-4" />
          Add New Product
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-2 border-red-500 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading text-teal-400">
            Add New Product
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Fill in the details below to add a new product to the inventory.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-300">
              Product Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter product name"
              className="bg-black/60 border-gray-600 text-white placeholder:text-gray-500 focus:border-teal-400"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-300">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleInputChange}
              placeholder="Enter product description"
              className="bg-black/60 border-gray-600 text-white placeholder:text-gray-500 focus:border-teal-400 min-h-[80px]"
            />
          </div>

          {/* Price Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="selling_price" className="text-gray-300">
                Selling Price ($) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="selling_price"
                name="selling_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.selling_price || ""}
                onChange={handleInputChange}
                placeholder="0.00"
                className="bg-black/60 border-gray-600 text-yellow-400 placeholder:text-gray-500 focus:border-teal-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchase_price" className="text-gray-300">
                Purchase Price ($) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="purchase_price"
                name="purchase_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.purchase_price || ""}
                onChange={handleInputChange}
                placeholder="0.00"
                className="bg-black/60 border-gray-600 text-gray-300 placeholder:text-gray-500 focus:border-teal-400"
              />
            </div>
          </div>

          {/* Supplier */}
          <div className="space-y-2">
            <Label htmlFor="supplier" className="text-gray-300">
              Supplier (Wing Corp) <span className="text-red-500">*</span>
            </Label>
            {loadingSuppliers ? (
              <div className="flex items-center text-gray-400 py-2">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading suppliers...
              </div>
            ) : (
              <Select
                value={
                  formData.supplier_id ? formData.supplier_id.toString() : ""
                }
                onValueChange={(value) =>
                  handleSelectChange("supplier_id", value)
                }
              >
                <SelectTrigger className="w-full bg-black/60 border-gray-600 text-white focus:border-teal-400">
                  <SelectValue placeholder="Select a supplier" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-600 text-white max-h-[300px]">
                  {suppliers.map((supplier) => (
                    <SelectItem
                      key={supplier.id}
                      value={supplier.id.toString()}
                      className="focus:bg-teal-900/50 focus:text-white"
                    >
                      <span className="font-bold text-teal-400">
                        {supplier.code} Corp.
                      </span>
                      <span className="text-gray-400 ml-2">
                        - {supplier.full_name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {selectedSupplier?.description && (
              <div className="mt-2 p-3 bg-black/40 border border-teal-800/50 rounded-lg">
                <p className="text-xs text-teal-400 font-semibold mb-1">
                  {selectedSupplier.full_name}
                </p>
                <p className="text-sm text-gray-400 italic">
                  {selectedSupplier.description}
                </p>
              </div>
            )}
          </div>

          {/* Category and Stock Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-gray-300">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange("category", value)}
              >
                <SelectTrigger className="w-full bg-black/60 border-gray-600 text-white focus:border-teal-400">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-600 text-white">
                  {CATEGORIES.map((category) => (
                    <SelectItem
                      key={category}
                      value={category}
                      className="focus:bg-teal-400 text-white"
                    >
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock" className="text-gray-300">
                Initial Stock <span className="text-red-500">*</span>
              </Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min="0"
                value={formData.stock || ""}
                onChange={handleInputChange}
                placeholder="0"
                className="bg-black/60 border-gray-600 text-white placeholder:text-gray-500 focus:border-teal-400"
              />
            </div>
          </div>

          {/* Reorder Settings Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reorder_level" className="text-gray-300">
                Reorder Level
              </Label>
              <Input
                id="reorder_level"
                name="reorder_level"
                type="number"
                min="0"
                value={formData.reorder_level || ""}
                onChange={handleInputChange}
                placeholder="50"
                className="bg-black/60 border-gray-600 text-orange-400 placeholder:text-gray-500 focus:border-teal-400"
              />
              <p className="text-xs text-gray-500">
                Alert when stock falls below this
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reorder_amount" className="text-gray-300">
                Reorder Amount
              </Label>
              <Input
                id="reorder_amount"
                name="reorder_amount"
                type="number"
                min="1"
                value={formData.reorder_amount || ""}
                onChange={handleInputChange}
                placeholder="100"
                className="bg-black/60 border-gray-600 text-yellow-400 placeholder:text-gray-500 focus:border-teal-400"
              />
              <p className="text-xs text-gray-500">
                Default quantity for bulk orders
              </p>
            </div>
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="image_url" className="text-gray-300">
              Image URL (optional)
            </Label>
            <Input
              id="image_url"
              name="image_url"
              value={formData.image_url || ""}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
              className="bg-black/60 border-gray-600 text-white placeholder:text-gray-500 focus:border-teal-400"
            />
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
              className="bg-teal-600 hover:bg-teal-700 text-white border-2 border-teal-400"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Product
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

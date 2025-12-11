"use client";

import { useState, useEffect } from "react";
import { Loader2, Pencil, Trash2, AlertTriangle } from "lucide-react";
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
import {
  updateProduct,
  deleteProduct,
  Product,
  ProductUpdate,
} from "@/lib/api/products";
import { getActiveSuppliers, SupplierBrief } from "@/lib/api/supplier";

interface EditProductDialogProps {
  product: Product;
  onProductUpdated: () => void;
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

export function EditProductDialog({
  product,
  onProductUpdated,
}: EditProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<SupplierBrief[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductUpdate>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Reset form when product changes or dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        name: product.name,
        description: product.description || "",
        selling_price: product.selling_price,
        purchase_price: product.purchase_price,
        supplier_id: product.supplier_id,
        stock: product.stock,
        reorder_level: product.reorder_level,
        reorder_amount: product.reorder_amount,
        category: product.category,
        image_url: product.image_url || "",
      });
      setError(null);
      setShowDeleteConfirm(false);
      fetchSuppliers();
    }
  }, [open, product]);

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
      await updateProduct(product.id, {
        ...formData,
        description: formData.description || null,
        image_url: formData.image_url || null,
      });

      setOpen(false);
      onProductUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setError(null);
    try {
      setDeleting(true);
      await deleteProduct(product.id);
      setOpen(false);
      onProductUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
      setDeleting(false);
    }
  }

  const selectedSupplier = suppliers.find((s) => s.id === formData.supplier_id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-teal-400 hover:text-teal-300 hover:bg-teal-900/30"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-2 border-red-500 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading text-teal-400">
            {showDeleteConfirm ? "Delete Product" : "Edit Product"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {showDeleteConfirm
              ? "Are you sure you want to delete this product?"
              : `Update the details for "${product.name}"`}
          </DialogDescription>
        </DialogHeader>

        {showDeleteConfirm ? (
          <div className="space-y-4 mt-4">
            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-red-200 font-semibold">
                    This action cannot be undone.
                  </p>
                  <p className="text-gray-300 text-sm">
                    You are about to permanently delete:
                  </p>
                  <div className="bg-black/40 rounded-lg p-3 mt-2">
                    <p className="text-white font-bold">{product.name}</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Stock: {product.stock} units • Category:{" "}
                      {product.category}
                    </p>
                    <p className="text-yellow-400 text-sm mt-1">
                      Value: $
                      {(product.selling_price * product.stock).toFixed(2)}
                    </p>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    This will remove the product from inventory and any
                    associated records.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white border-2 border-red-400"
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Product
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-gray-300">
                Product Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                placeholder="Enter product name"
                className="bg-black/60 border-gray-600 text-white placeholder:text-gray-500 focus:border-teal-400"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-gray-300">
                Description
              </Label>
              <Textarea
                id="edit-description"
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
                <Label htmlFor="edit-selling_price" className="text-gray-300">
                  Selling Price ($) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-selling_price"
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
                <Label htmlFor="edit-purchase_price" className="text-gray-300">
                  Purchase Price ($) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-purchase_price"
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
              <Label htmlFor="edit-supplier" className="text-gray-300">
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
                    {selectedSupplier.code} Corp. - {selectedSupplier.full_name}
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
                <Label htmlFor="edit-category" className="text-gray-300">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    handleSelectChange("category", value)
                  }
                >
                  <SelectTrigger className="w-full bg-black/60 border-gray-600 text-white focus:border-teal-400">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-600 text-white">
                    {CATEGORIES.map((category) => (
                      <SelectItem
                        key={category}
                        value={category}
                        className="focus:bg-teal-500 text-white"
                      >
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-stock" className="text-gray-300">
                  Stock <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-stock"
                  name="stock"
                  type="number"
                  min="0"
                  value={formData.stock ?? ""}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="bg-black/60 border-gray-600 text-white placeholder:text-gray-500 focus:border-teal-400"
                />
              </div>
            </div>

            {/* Reorder Settings Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-reorder_level" className="text-gray-300">
                  Reorder Level
                </Label>
                <Input
                  id="edit-reorder_level"
                  name="reorder_level"
                  type="number"
                  min="0"
                  value={formData.reorder_level ?? ""}
                  onChange={handleInputChange}
                  placeholder="50"
                  className="bg-black/60 border-gray-600 text-orange-400 placeholder:text-gray-500 focus:border-teal-400"
                />
                <p className="text-xs text-gray-500">
                  Alert when stock falls below this
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-reorder_amount" className="text-gray-300">
                  Reorder Amount
                </Label>
                <Input
                  id="edit-reorder_amount"
                  name="reorder_amount"
                  type="number"
                  min="1"
                  value={formData.reorder_amount ?? ""}
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
              <Label htmlFor="edit-image_url" className="text-gray-300">
                Image URL (optional)
              </Label>
              <Input
                id="edit-image_url"
                name="image_url"
                value={formData.image_url || ""}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                className="bg-black/60 border-gray-600 text-white placeholder:text-gray-500 focus:border-teal-400"
              />
            </div>

            <DialogFooter className="mt-6 flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-transparent border-red-600 text-red-400 hover:bg-red-900/30 hover:text-red-300 sm:mr-auto"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
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
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

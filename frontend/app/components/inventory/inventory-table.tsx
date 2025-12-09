"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Search, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProducts, Product } from "@/lib/api/products";
import { getStockStatus } from "@/lib/stock-status";
import { AddProductDialog } from "./add-product-dialog";
import { EditProductDialog } from "./edit-product-dialog";
import { SupplierOrderDialog } from "./supplier-order-dialog";
import { BulkSupplierOrderDialog } from "./bulk-supplier-order-dialog";
import { PendingSupplierOrders } from "./pending-supplier-orders";

function createColumns(onProductUpdated: () => void): ColumnDef<Product>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-teal-200 hover:text-white hover:bg-transparent p-0"
        >
          Product Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-semibold text-teal-200">
          {row.getValue("name")}
        </span>
      ),
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-teal-200 hover:text-white hover:bg-transparent p-0"
        >
          Category
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-gray-300 text-sm">
          {row.getValue("category")}
        </span>
      ),
    },
    {
      accessorKey: "selling_price",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-teal-200 hover:text-white hover:bg-transparent p-0"
        >
          Selling Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-yellow-400 font-bold">
          ${(row.getValue("selling_price") as number).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "purchase_price",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-teal-200 hover:text-white hover:bg-transparent p-0"
        >
          Purchase Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-gray-300">
          ${(row.getValue("purchase_price") as number).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "supplier_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-teal-200 hover:text-white hover:bg-transparent p-0"
        >
          Supplier
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-gray-300">{row.getValue("supplier_name")}</span>
      ),
    },
    {
      accessorKey: "stock",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-teal-200 hover:text-white hover:bg-transparent p-0"
        >
          Stock
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const stock = row.getValue("stock") as number;
        const status = getStockStatus(stock);
        return <span className={status.className.split(" ")[0]}>{stock}</span>;
      },
    },
    {
      id: "restockStatus",
      header: "Restock Status",
      cell: ({ row }) => {
        const stock = row.original.stock;
        const status = getStockStatus(stock);
        return (
          <span
            className={`px-3 py-1 rounded-lg border-2 text-center text-xs font-bold ${status.className}`}
          >
            {status.text}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const product = row.original;
        const isLowStock = product.stock < product.reorder_level;

        return (
          <div className="flex items-center gap-1">
            <EditProductDialog
              product={product}
              onProductUpdated={onProductUpdated}
            />
            {isLowStock && (
              <SupplierOrderDialog
                product={product}
                onOrderCreated={onProductUpdated}
              />
            )}
          </div>
        );
      },
    },
  ];
}

export function InventoryTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchProducts = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleRefresh = useCallback(() => {
    fetchProducts();
    setRefreshTrigger((prev) => prev + 1);
  }, [fetchProducts]);

  const columns = createColumns(handleRefresh);

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
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
    <div className="w-full space-y-4">
      {/* Pending Supplier Orders */}
      <PendingSupplierOrders
        onStockUpdated={handleRefresh}
        refreshTrigger={refreshTrigger}
      />

      {/* Header with Search and Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="pl-10 bg-black/60 border-2 border-teal-600 text-white placeholder:text-gray-500 focus:border-teal-400"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <BulkSupplierOrderDialog
            products={products}
            onOrderCreated={handleRefresh}
          />
          <AddProductDialog onProductAdded={handleRefresh} />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border-2 border-red-500 overflow-hidden bg-black/60 backdrop-blur-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b-2 border-red-500 hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-teal-200 font-heading font-bold bg-black/80 py-4"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-b border-red-500/30 hover:bg-red-900/20 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4 font-body">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-gray-400"
                >
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Table Footer Info */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>
          Showing {table.getFilteredRowModel().rows.length} of {products.length}{" "}
          products
        </span>
        <span className="text-yellow-400">
          {products.filter((p) => p.stock < LOW_STOCK_THRESHOLD).length} items
          need restocking
        </span>
      </div>
    </div>
  );
}

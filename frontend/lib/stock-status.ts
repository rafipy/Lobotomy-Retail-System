export interface StockStatus {
  needsRestock: boolean;
  text: string;
  className: string;
}

export function getStockStatus(stock: number): StockStatus {
  if (stock === 0) {
    return {
      needsRestock: true,
      text: "OUT OF STOCK",
      className: "text-red-500 bg-red-950/50 border-red-600",
    };
  } else if (stock < 50) {
    return {
      needsRestock: true,
      text: "RESTOCK NEEDED",
      className: "text-yellow-400 bg-yellow-950/50 border-yellow-600",
    };
  } else {
    return {
      needsRestock: false,
      text: "IN STOCK",
      className: "text-teal-400 bg-teal-950/50 border-teal-600",
    };
  }
}

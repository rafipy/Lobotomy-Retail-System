"use client";

import { createContext, useContext, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/api/products";
import { ShoppingCart, X, Plus, Minus, Trash2, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setCheckoutItems } from "@/lib/api/checkout";

// ============================================
// CART TYPES
// ============================================
export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  removeItems: (productIds: number[]) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

// ============================================
// CART CONTEXT (stores cart data globally)
// ============================================
const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

// ============================================
// CART PROVIDER (wraps the app to provide cart functions)
// ============================================
export function CartProvider({ children }: { children: React.ReactNode }) {
  // Initialize state directly from localStorage (no useEffect needed)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    // Check if we're in the browser (not server-side)
    if (typeof window === "undefined") {
      return [];
    }
    
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      return JSON.parse(savedCart);
    }
    return [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.product.id === product.id);
      if (existingItem) {
        // Increase quantity if already in cart
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      // Add new item
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCartItems((prev) =>
      prev.filter((item) => item.product.id !== productId),
    );
  };

  const removeItems = (productIds: number[]) => {
    setCartItems((prev) =>
      prev.filter((item) => !productIds.includes(item.product.id)),
    );
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item,
      ),
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.product.selling_price * item.quantity,
      0,
    );
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        removeItems,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ============================================
// CART DROPDOWN (shows cart items)
// ============================================
interface CartDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDropdown({ isOpen, onClose }: CartDropdownProps) {
  const router = useRouter();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  // Track selected items for checkout (by product ID)
  // Initialize from localStorage or default to all items selected
  const [selectedItems, setSelectedItems] = useState<Set<number>>(() => {
    if (typeof window === "undefined") {
      return new Set();
    }
    
    const savedSelection = localStorage.getItem("cart_selected_items");
    if (savedSelection) {
      const savedIds = JSON.parse(savedSelection) as number[];
      return new Set(savedIds);
    }
    
    // Default: select all items
    return new Set(cartItems.map((item) => item.product.id));
  });

  // Save selected items to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart_selected_items", JSON.stringify(Array.from(selectedItems)));
  }, [selectedItems]);

  // When a new item is added to cart, auto-select it
  // Track cart item IDs to detect new additions
  const [prevCartIds, setPrevCartIds] = useState<Set<number>>(() => {
    return new Set(cartItems.map((item) => item.product.id));
  });

  // Detect new items added to cart and auto-select them
  const currentCartIds = new Set(cartItems.map((item) => item.product.id));
  const newItemIds = Array.from(currentCartIds).filter((id) => !prevCartIds.has(id));
  
  if (newItemIds.length > 0) {
    // New items detected, add them to selection
    const updatedSelection = new Set(selectedItems);
    newItemIds.forEach((id) => updatedSelection.add(id));
    setSelectedItems(updatedSelection);
    setPrevCartIds(currentCartIds);
  }

  // Also remove selection for items that are no longer in cart
  const removedItemIds = Array.from(selectedItems).filter((id) => !currentCartIds.has(id));
  if (removedItemIds.length > 0) {
    const updatedSelection = new Set(selectedItems);
    removedItemIds.forEach((id) => updatedSelection.delete(id));
    setSelectedItems(updatedSelection);
  }

  // Update prevCartIds if items were removed
  if (prevCartIds.size !== currentCartIds.size || removedItemIds.length > 0) {
    if (Array.from(prevCartIds).some((id) => !currentCartIds.has(id))) {
      setPrevCartIds(currentCartIds);
    }
  }

  // Toggle single item selection
  const toggleItemSelection = (productId: number) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  // Toggle all items selection
  const toggleSelectAll = () => {
    if (selectedItems.size === cartItems.length) {
      // Deselect all
      setSelectedItems(new Set());
    } else {
      // Select all
      setSelectedItems(new Set(cartItems.map((item) => item.product.id)));
    }
  };

  // Get selected cart items
  const getSelectedCartItems = () => {
    return cartItems.filter((item) => selectedItems.has(item.product.id));
  };

  // Calculate total for selected items only
  const getSelectedTotalPrice = () => {
    return getSelectedCartItems().reduce(
      (total, item) => total + item.product.selling_price * item.quantity,
      0,
    );
  };

  const handleCheckout = () => {
    const selectedCartItems = getSelectedCartItems();
    
    if (selectedCartItems.length === 0) {
      return; // Don't proceed if nothing selected
    }

    // Set checkout items from selected cart items only
    setCheckoutItems(selectedCartItems.map((item) => ({
      product: item.product,
      quantity: item.quantity,
    })));
    
    // Store selected item IDs so checkout page knows which items to remove after order completes
    localStorage.setItem("checkout_selected_ids", JSON.stringify(Array.from(selectedItems)));
    
    // Flag that this checkout is from cart
    localStorage.setItem("checkout_from_cart", "true");
    onClose();
    router.push("/customer/checkout");
  };

  // Handle clear cart - also clear selection
  const handleClearCart = () => {
    clearCart();
    setSelectedItems(new Set());
    localStorage.removeItem("cart_selected_items");
  };

  if (!isOpen) return null;

  const allSelected = cartItems.length > 0 && selectedItems.size === cartItems.length;
  const someSelected = selectedItems.size > 0 && selectedItems.size < cartItems.length;

  return (
    <div className="absolute right-0 top-full mt-2 w-96 bg-black/95 border-2 border-teal-500 rounded-xl shadow-lg shadow-teal-500/20 z-50 animate-fade-in">
      <div className="p-4 border-b border-teal-500/50">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-heading font-bold text-teal-200">
            Your Cart
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="bg-teal-700 text-gray-400 hover:bg-teal-900"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {cartItems.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Your cart is empty</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {/* Select All Toggle */}
            <div 
              className="flex items-center gap-2 pb-2 border-b border-teal-500/30 cursor-pointer hover:bg-teal-900/20 rounded p-1 -m-1"
              onClick={toggleSelectAll}
            >
              <button className="text-teal-400 hover:text-teal-300 transition-colors">
                {allSelected ? (
                  <CheckSquare className="h-5 w-5" />
                ) : someSelected ? (
                  <div className="relative">
                    <Square className="h-5 w-5" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-teal-400 rounded-sm" />
                    </div>
                  </div>
                ) : (
                  <Square className="h-5 w-5" />
                )}
              </button>
              <span className="text-sm text-gray-400">
                {allSelected ? "Deselect All" : "Select All"} ({selectedItems.size}/{cartItems.length})
              </span>
            </div>

            {cartItems.map((item) => {
              const isSelected = selectedItems.has(item.product.id);
              
              return (
                <div
                  key={item.product.id}
                  className={`flex items-center gap-3 bg-black/40 p-3 rounded-lg border transition-all ${
                    isSelected 
                      ? "border-teal-500/50 bg-teal-900/20" 
                      : "border-gray-600/30 opacity-60"
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleItemSelection(item.product.id)}
                    className="text-teal-400 hover:text-teal-300 transition-colors shrink-0"
                  >
                    {isSelected ? (
                      <CheckSquare className="h-5 w-5" />
                    ) : (
                      <Square className="h-5 w-5" />
                    )}
                  </button>

                  {/* Product Image */}
                  <div className="relative w-12 h-12 bg-gray-800 rounded-lg overflow-hidden shrink-0">
                    {item.product.image_url ? (
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-2xl">
                        📦
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-teal-200 truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-xs text-yellow-400">
                      ${item.product.selling_price.toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity - 1)
                      }
                      className="h-6 w-6 text-teal-400 hover:bg-teal-900/50"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-white w-6 text-center text-sm">
                      {item.quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity + 1)
                      }
                      className="h-6 w-6 text-teal-400 hover:bg-teal-900/50"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromCart(item.product.id)}
                    className="h-6 w-6 text-red-400 hover:bg-red-900/50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="p-4 border-t border-teal-500/50 space-y-3">
          {/* Selected Total */}
          <div className="flex justify-between items-center">
            <span className="text-gray-400">
              Selected ({selectedItems.size} item{selectedItems.size !== 1 ? "s" : ""}):
            </span>
            <span className="text-xl font-bold text-yellow-400">
              ${getSelectedTotalPrice().toFixed(2)}
            </span>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleClearCart}
              variant="outline"
              className="flex-1 bg-red-700 border-red-700 hover:bg-red-900 hover:border-red-900 text-white hover:text-white font-bold"
            >
              Clear Cart
            </Button>
            <Button 
              onClick={handleCheckout}
              disabled={selectedItems.size === 0}
              className={`flex-1 font-bold ${
                selectedItems.size === 0
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-teal-600 hover:bg-teal-700 text-white"
              }`}
            >
              Checkout ({selectedItems.size})
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

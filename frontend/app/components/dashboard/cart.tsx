"use client";

import { createContext, useContext, useState, useEffect } from "react";
import Image from "next/image";
import { Product } from "@/lib/api/products";
import { ShoppingCart, X, Plus, Minus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    clearCart,
  } = useCart();

  if (!isOpen) return null;

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
            {cartItems.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-3 bg-black/40 p-3 rounded-lg border border-teal-500/30"
              >
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
            ))}
          </div>
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="p-4 border-t border-teal-500/50 space-y-3">
          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Total:</span>
            <span className="text-xl font-bold text-yellow-400">
              ${getTotalPrice().toFixed(2)}
            </span>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={clearCart}
              variant="outline"
              className="flex-1 border-red-500 text-red-400 hover:bg-red-900/50"
            >
              Clear Cart
            </Button>
            <Button className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold">
              Checkout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

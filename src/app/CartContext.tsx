import React, { createContext, useContext, useState, useMemo } from 'react';
import { MeasurementType } from '@city-market/shared';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity?: number;
    weight?: number;
    weightGrams?: number;
    vendorId: string;
    measurementType: MeasurementType;
    imageUrl?: string;
    isAvailable?: boolean;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    updateWeight: (id: string, weightGrams: number) => void;
    clearCart: () => void;
    total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>([]);

    const addToCart = (item: CartItem) => {
        if (item.isAvailable === false) {
            console.warn('Attempted to add unavailable item to cart', item.id);
            return;
        }
        setItems((prev) => {
            const existing = prev.find((i) => i.id === item.id);
            if (existing) {
                if (item.measurementType === MeasurementType.UNIT) {
                    return prev.map((i) => i.id === item.id ? { ...i, quantity: (i.quantity || 0) + (item.quantity || 1) } : i);
                } else {
                    return prev.map((i) => i.id === item.id ? { 
                        ...i, 
                        weightGrams: (i.weightGrams || 0) + (item.weightGrams || 500),
                        weight: ((i.weightGrams || 0) + (item.weightGrams || 500)) / 1000
                    } : i);
                }
            }
            return [...prev, item];
        });
    };

    const removeFromCart = (id: string) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(id);
            return;
        }
        setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity } : i));
    };

    const updateWeight = (id: string, weightGrams: number) => {
        if (weightGrams <= 0) {
            removeFromCart(id);
            return;
        }
        setItems((prev) => prev.map((i) => i.id === id ? { ...i, weightGrams, weight: weightGrams / 1000 } : i));
    };

    const clearCart = () => setItems([]);

    const total = useMemo(() => items.reduce((sum, item) => {
        if (item.measurementType === MeasurementType.UNIT) {
            return sum + item.price * (item.quantity || 0);
        } else {
            return sum + (item.price * (item.weightGrams || 0)) / 1000;
        }
    }, 0), [items]);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, updateWeight, clearCart, total }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};

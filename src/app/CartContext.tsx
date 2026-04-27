import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MeasurementType } from '@city-market/shared';

const CART_STORAGE_KEY = '@citymarket_cart';

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
    itemCount: number;
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
    const [isHydrated, setIsHydrated] = useState(false);

    // Load persisted cart on mount
    useEffect(() => {
        AsyncStorage.getItem(CART_STORAGE_KEY)
            .then(data => {
                if (data) setItems(JSON.parse(data));
            })
            .catch(() => {})
            .finally(() => setIsHydrated(true));
    }, []);

    // Persist cart to AsyncStorage whenever it changes (after initial load)
    useEffect(() => {
        if (!isHydrated) return;
        AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items)).catch(() => {});
    }, [items, isHydrated]);

    const addToCart = (item: CartItem) => {
        if (item.isAvailable === false) return;
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

    const clearCart = () => {
        setItems([]);
        AsyncStorage.removeItem(CART_STORAGE_KEY).catch(() => {});
    };

    const total = useMemo(() => items.reduce((sum, item) => {
        if (item.measurementType === MeasurementType.UNIT) {
            return sum + item.price * (item.quantity || 0);
        } else {
            return sum + (item.price * (item.weightGrams || 0)) / 1000;
        }
    }, 0), [items]);

    const itemCount = useMemo(() => items.reduce((sum, item) => {
        if (item.measurementType === MeasurementType.UNIT) {
            return sum + (item.quantity || 1);
        }
        return sum + 1;
    }, 0), [items]);

    return (
        <CartContext.Provider value={{ items, itemCount, addToCart, removeFromCart, updateQuantity, updateWeight, clearCart, total }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};

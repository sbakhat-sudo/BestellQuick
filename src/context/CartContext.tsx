import { type ReactNode, createContext, useContext, useMemo, useState } from 'react'
import type { MenuItem } from '@/types/database.types'

export interface CartLine {
  item: MenuItem
  quantity: number
}

interface CartContextValue {
  lines: CartLine[]
  addItem: (item: MenuItem) => void
  removeItem: (itemId: string) => void
  setQuantity: (itemId: string, quantity: number) => void
  clear: () => void
  total: number
  count: number
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])

  const addItem = (item: MenuItem) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.item.id === item.id)
      if (existing) {
        return prev.map((l) => (l.item.id === item.id ? { ...l, quantity: l.quantity + 1 } : l))
      }
      return [...prev, { item, quantity: 1 }]
    })
  }

  const removeItem = (itemId: string) => {
    setLines((prev) => prev.filter((l) => l.item.id !== itemId))
  }

  const setQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId)
      return
    }
    setLines((prev) => prev.map((l) => (l.item.id === itemId ? { ...l, quantity } : l)))
  }

  const clear = () => setLines([])

  const total = useMemo(() => lines.reduce((sum, l) => sum + Number(l.item.price) * l.quantity, 0), [lines])
  const count = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines])

  return (
    <CartContext.Provider value={{ lines, addItem, removeItem, setQuantity, clear, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

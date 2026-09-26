import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type OrderState = { open: boolean; slug: string | null };
type OrderApi = { openOrder: (slug?: string) => void; closeOrder: () => void; state: OrderState; setSlug: (s: string | null) => void };

const OrderContext = createContext<OrderApi | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OrderState>({ open: false, slug: null });
  const openOrder = useCallback((slug?: string) => setState({ open: true, slug: slug ?? null }), []);
  const closeOrder = useCallback(() => setState((s) => ({ ...s, open: false })), []);
  const setSlug = useCallback((slug: string | null) => setState((s) => ({ ...s, slug })), []);
  const value = useMemo(() => ({ openOrder, closeOrder, state, setSlug }), [openOrder, closeOrder, state, setSlug]);
  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder must be used inside <OrderProvider>");
  return ctx;
}

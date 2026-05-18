"use client";

import { useCart } from "@/lib/cart";
import { useEffect, useState } from "react";

export function CartBadge() {
  const count = useCart((s) => s.count());
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || count === 0) return null;
  return <span className="ml-1 inline-flex items-center justify-center bg-ink text-paper text-[10px] rounded-full w-4 h-4">{count}</span>;
}

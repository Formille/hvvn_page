"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";

export function HeaderMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const count = useCart((s) => s.count());

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const badge = mounted && count > 0;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Cart menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="relative flex items-center text-chrome hover:opacity-80 transition"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="20" r="1.4" />
          <circle cx="17" cy="20" r="1.4" />
          <path d="M2 3h3l2.2 12.2a1.5 1.5 0 0 0 1.5 1.3h7.8a1.5 1.5 0 0 0 1.5-1.2L21 7H6" />
        </svg>
        {badge && (
          <span className="absolute -top-1.5 -right-2 bg-chrome text-black text-[10px] rounded-full w-4 h-4 flex items-center justify-center leading-none">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-40 bg-black border border-line py-2 text-[12px] tracking-widest2 uppercase z-50">
          <Link href="/cart" onClick={() => setOpen(false)} className="block px-4 py-2 hover:bg-velvetGlow/40 transition">
            Cart{badge ? ` (${count})` : ""}
          </Link>
          <Link href="/orders" onClick={() => setOpen(false)} className="block px-4 py-2 hover:bg-velvetGlow/40 transition">
            Orders
          </Link>
        </div>
      )}
    </div>
  );
}

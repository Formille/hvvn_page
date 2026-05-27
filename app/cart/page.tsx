"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { formatKRW } from "@/lib/format";

export default function CartPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const lines = useCart((s) => s.lines);
  const remove = useCart((s) => s.remove);
  const setQuantity = useCart((s) => s.setQuantity);
  const subtotal = useCart((s) => s.subtotal());

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  if (lines.length === 0) {
    return (
      <div className="container-page py-32 flex flex-col items-center text-center">
        <div className="eyebrow mb-4">— Cart</div>
        <h1 className="font-gothic chrome-text text-4xl md:text-5xl mb-8">empty</h1>
        <p className="text-sm text-muted mb-8">장바구니가 비어 있습니다.</p>
        <Link href="/" className="btn-outline">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className="container-page py-12 md:py-16">
      <div className="eyebrow mb-2">— Cart · {lines.length}</div>
      <h1 className="font-gothic chrome-text text-4xl md:text-6xl mb-10">cart</h1>

      <div className="grid lg:grid-cols-3 gap-10 lg:gap-14">
        <ul className="lg:col-span-2 border-t border-line">
          {lines.map((l) => (
            <li key={l.product_id} className="py-5 border-b border-line flex gap-4 sm:gap-6">
              <Link href={`/products/${l.slug}`} className="relative w-20 h-20 sm:w-28 sm:h-28 shrink-0 bg-velvetGlow/20 overflow-hidden">
                {l.thumbnail_url && <Image src={l.thumbnail_url} alt={l.name} fill className="object-contain" sizes="112px" />}
              </Link>
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex justify-between gap-3">
                  <Link href={`/products/${l.slug}`} className="font-gothic text-xl sm:text-2xl text-chrome leading-tight hover:opacity-70 transition truncate">
                    {l.name}
                  </Link>
                  <div className="text-sm text-chrome whitespace-nowrap">{formatKRW(l.price_krw * l.quantity)}</div>
                </div>
                <div className="text-xs text-muted mt-1">{formatKRW(l.price_krw)} / 개</div>
                <div className="flex items-center gap-4 mt-auto pt-3">
                  <div className="flex items-center border border-line">
                    <button aria-label="수량 감소" onClick={() => setQuantity(l.product_id, l.quantity - 1)} className="w-8 h-8 text-chrome hover:bg-velvetGlow/40 transition">−</button>
                    <span className="w-9 text-center text-sm text-chrome">{l.quantity}</span>
                    <button aria-label="수량 증가" onClick={() => setQuantity(l.product_id, l.quantity + 1)} className="w-8 h-8 text-chrome hover:bg-velvetGlow/40 transition">+</button>
                  </div>
                  <button onClick={() => remove(l.product_id)} className="text-[11px] tracking-widest2 uppercase text-muted hover:text-chrome transition">Remove</button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="lg:col-span-1">
          <div className="border border-line p-6 lg:sticky lg:top-24 space-y-4">
            <div className="eyebrow">— Summary</div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">상품 합계</span>
              <span className="text-chrome">{formatKRW(subtotal)}</span>
            </div>
            <p className="text-xs text-muted">배송비는 결제 단계에서 계산됩니다.</p>
            <div className="hairline" />
            <button className="btn w-full" onClick={() => router.push("/checkout")}>주문하기</button>
            <Link href="/" className="block text-center text-[11px] tracking-widest2 uppercase text-muted hover:text-chrome transition">Continue shopping</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

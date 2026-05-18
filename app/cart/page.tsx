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
      <div className="container-page py-24 text-center">
        <div className="eyebrow mb-3">— Cart</div>
        <h1 className="font-serif text-3xl mb-6">장바구니가 비어 있습니다.</h1>
        <Link href="/" className="btn-outline">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className="container-page py-16 grid md:grid-cols-3 gap-10">
      <div className="md:col-span-2">
        <div className="eyebrow mb-3">— Cart · {lines.length}</div>
        <h1 className="font-serif text-3xl mb-8">장바구니</h1>
        <ul className="divide-y divide-line border-y border-line">
          {lines.map((l) => (
            <li key={l.product_id} className="py-5 grid grid-cols-[100px_1fr_auto] gap-4 items-center">
              <div className="relative aspect-square bg-sand">
                {l.thumbnail_url && (
                  <Image src={l.thumbnail_url} alt={l.name} fill className="object-cover" sizes="100px" />
                )}
              </div>
              <div>
                <Link href={`/products/${l.slug}`} className="font-serif text-lg hover:underline">{l.name}</Link>
                <div className="text-sm text-muted mt-1">{formatKRW(l.price_krw)}</div>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border border-line">
                    <button onClick={() => setQuantity(l.product_id, l.quantity - 1)} className="w-8 h-8 hover:bg-sand">−</button>
                    <span className="w-8 text-center text-sm">{l.quantity}</span>
                    <button onClick={() => setQuantity(l.product_id, l.quantity + 1)} className="w-8 h-8 hover:bg-sand">+</button>
                  </div>
                  <button onClick={() => remove(l.product_id)} className="text-xs underline text-muted hover:text-ink">삭제</button>
                </div>
              </div>
              <div className="text-right">{formatKRW(l.price_krw * l.quantity)}</div>
            </li>
          ))}
        </ul>
      </div>
      <aside className="md:col-span-1">
        <div className="border border-line p-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted">상품 합계</span>
            <span>{formatKRW(subtotal)}</span>
          </div>
          <div className="text-xs text-muted">배송비는 결제 단계에서 계산됩니다.</div>
          <button className="btn w-full mt-4" onClick={() => router.push("/checkout")}>주문하기</button>
          <Link href="/" className="block text-center text-xs underline text-muted hover:text-ink mt-2">계속 쇼핑하기</Link>
        </div>
      </aside>
    </div>
  );
}

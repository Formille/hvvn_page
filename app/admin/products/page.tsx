import Link from "next/link";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatKRW } from "@/lib/format";
import type { Product } from "@/lib/types";

export default async function AdminProductsPage() {
  const sb = await createSupabaseServerClient();
  const { data } = await sb.from("products").select("*").order("created_at", { ascending: false });
  const list = (data ?? []) as Product[];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="eyebrow">— Products · {list.length}</div>
        <div className="flex gap-2">
          <Link href="/admin/sets/new" className="btn-outline">+ Set</Link>
          <Link href="/admin/products/new" className="btn">+ New product</Link>
        </div>
      </div>

      <div className="grid gap-3">
        {list.map((p) => (
          <Link
            key={p.id}
            href={`/admin/products/${p.id}/edit`}
            className="grid grid-cols-[60px_1fr_120px_100px_80px] gap-4 items-center border border-line p-3 hover:bg-sand/30"
          >
            <div className="relative aspect-square bg-sand">
              {p.thumbnail_url && <Image src={p.thumbnail_url} alt={p.name} fill className="object-cover" sizes="60px" />}
            </div>
            <div>
              <div className="font-serif text-lg">{p.name}</div>
              <div className="text-xs text-muted font-mono">{p.slug}</div>
            </div>
            <div className="text-sm">{formatKRW(p.price_krw)}</div>
            <div className={`text-sm ${p.stock === 0 ? "text-accent" : ""}`}>재고 {p.stock}</div>
            <div className="flex gap-1 flex-wrap text-[10px] tracking-widest2 uppercase">
              {p.is_set && <span className="border border-line px-1.5 py-0.5">Set</span>}
              {!p.is_published && <span className="border border-line px-1.5 py-0.5">Draft</span>}
            </div>
          </Link>
        ))}
        {list.length === 0 && <div className="py-16 text-center text-muted">등록된 상품이 없습니다.</div>}
      </div>
    </div>
  );
}

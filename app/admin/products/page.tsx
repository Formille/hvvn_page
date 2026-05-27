import Link from "next/link";
import Image from "next/image";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { formatKRW } from "@/lib/format";
import type { Product } from "@/lib/types";

export default async function AdminProductsPage() {
  const sb = createSupabaseServiceClient();
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
            className="flex gap-4 items-center border border-line p-3 hover:bg-velvetGlow/20 transition"
          >
            <div className="relative w-14 h-14 shrink-0 bg-velvetGlow/20">
              {p.thumbnail_url && <Image src={p.thumbnail_url} alt={p.name} fill className="object-contain" sizes="56px" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-gothic text-lg text-chrome truncate">{p.name}</div>
              <div className="text-xs text-muted font-mono truncate">{p.slug}</div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm">
                <span className="text-chrome">{formatKRW(p.price_krw)}</span>
                <span className={p.stock === 0 ? "text-accent" : "text-muted"}>재고 {p.stock}</span>
                {p.is_set && <span className="text-[10px] tracking-widest2 uppercase border border-line px-1.5 py-0.5 text-muted">Set</span>}
                {!p.is_published && <span className="text-[10px] tracking-widest2 uppercase border border-line px-1.5 py-0.5 text-muted">Draft</span>}
              </div>
            </div>
          </Link>
        ))}
        {list.length === 0 && <div className="py-16 text-center text-muted">등록된 상품이 없습니다.</div>}
      </div>
    </div>
  );
}

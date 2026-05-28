import Link from "next/link";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatKRW } from "@/lib/format";
import type { Product } from "@/lib/types";

// Deterministic per-index tilt (hydration-safe — no Math.random at render).
const TILTS = [-3, 2.2, -1.4, 3, -2.4, 1.6, -2.8, 1.2];

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const { data: productsData } = await supabase
    .from("products")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  const products = (productsData ?? []) as Product[];

  return (
    <section className="container-page pt-10 md:pt-16 pb-28">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14 max-w-4xl mx-auto">
        {products.map((p, i) => (
          <Link key={p.id} href={`/products/${p.slug}`} className="group flex flex-col items-center text-center">
            <div
              className="tilt relative w-full max-w-[320px] aspect-square bg-velvetGlow/20 overflow-hidden"
              style={{ ["--tilt" as string]: `${TILTS[i % TILTS.length]}deg` }}
            >
              {p.thumbnail_url && (
                <Image
                  src={p.thumbnail_url}
                  alt={p.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                />
              )}
              {p.stock === 0 && (
                <span className="absolute top-2 right-2 text-[10px] tracking-widest2 uppercase bg-chrome text-black px-2 py-0.5">Sold out</span>
              )}
            </div>
            <div className="mt-5 font-gothic chrome-text text-2xl md:text-3xl leading-none">{p.name}</div>
            <div className="mt-1 text-sm chrome-text-soft font-gothic tracking-wider">{formatKRW(p.price_krw)}</div>
          </Link>
        ))}
        {products.length === 0 && (
          <div className="col-span-full py-20 text-center text-muted">등록된 상품이 없습니다.</div>
        )}
      </div>
    </section>
  );
}

import Link from "next/link";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatKRW } from "@/lib/format";
import type { Product } from "@/lib/types";
import { BrandLogo } from "@/components/brand-logo";

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
    <>
      {/* Top banner (horizontal) — desktop only. Falls back to chrome text until a banner PNG is added. */}
      <section className="container-page pt-14 pb-6 hidden md:flex justify-center">
        <BrandLogo
          src="/images/hvving-banner.png"
          alt="hvving"
          className="w-[72vw] max-w-[640px] h-auto object-contain"
          fallbackClassName="text-7xl"
        />
      </section>

      {/* Mobile-only: vertical calligraphy hero so the logo is visible on phones */}
      <div className="md:hidden flex justify-center pt-8 pb-6">
        <BrandLogo
          src="/images/hvving-vertical.png"
          alt="hvving"
          vertical
          className="h-[38vh] w-auto object-contain"
          fallbackClassName="text-4xl"
        />
      </div>

      {/* Desktop: vertical calligraphy in left column + products. Mobile: 1-col products. */}
      <section className="container-page grid grid-cols-1 md:grid-cols-[130px_1fr] lg:grid-cols-[160px_1fr] gap-8 md:gap-10 pb-24">
        <aside className="hidden md:flex justify-center">
          <div className="sticky top-24 self-start py-2">
            <BrandLogo
              src="/images/hvving-vertical.png"
              alt="hvving"
              vertical
              className="h-[62vh] w-auto object-contain"
              fallbackClassName="text-5xl h-[62vh]"
            />
          </div>
        </aside>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14">
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
                    className="object-cover"
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                  />
                )}
                {p.stock === 0 && (
                  <span className="absolute top-2 right-2 text-[10px] tracking-widest2 uppercase bg-chrome text-black px-2 py-0.5">Sold out</span>
                )}
              </div>
              <div className="mt-5 font-gothic text-xl md:text-2xl text-chrome leading-none">{p.name}</div>
              <div className="mt-1 text-sm text-muted">{formatKRW(p.price_krw)}</div>
            </Link>
          ))}
          {products.length === 0 && (
            <div className="col-span-full py-20 text-center text-muted">등록된 상품이 없습니다.</div>
          )}
        </div>
      </section>
    </>
  );
}

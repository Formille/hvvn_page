import Link from "next/link";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatKRW } from "@/lib/format";
import type { Product } from "@/lib/types";
import { BrandLogo } from "@/components/brand-logo";

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
      {/* Top — horizontal chrome wordmark */}
      <section className="container-page pt-12 pb-10 md:pt-16 md:pb-14 flex justify-center">
        <BrandLogo
          src="/images/hvving-chrome.png"
          alt="hvving"
          className="w-[80vw] max-w-[720px] h-auto object-contain"
          fallbackClassName="text-6xl md:text-8xl"
        />
      </section>

      {/* Vertical logo (left) + product grid */}
      <section className="container-page grid grid-cols-1 md:grid-cols-[110px_1fr] lg:grid-cols-[150px_1fr] gap-6 md:gap-10 pb-24">
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

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-12">
          {products.map((p) => (
            <Link key={p.id} href={`/products/${p.slug}`} className="group flex flex-col items-center text-center">
              <div className="relative w-full aspect-square bg-velvetGlow/20 overflow-hidden">
                {p.thumbnail_url && (
                  <Image
                    src={p.thumbnail_url}
                    alt={p.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.04]"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                )}
                {p.stock === 0 && (
                  <span className="absolute top-2 right-2 text-[10px] tracking-widest2 uppercase bg-chrome text-black px-2 py-0.5">Sold out</span>
                )}
              </div>
              <div className="mt-3 font-gothic text-xl md:text-2xl text-chrome leading-none">{p.name}</div>
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

import Link from "next/link";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatKRW } from "@/lib/format";
import type { Product } from "@/lib/types";
import { ViewToggle } from "@/components/view-toggle";
import { BrandLogo } from "@/components/brand-logo";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const isList = view === "list";

  const supabase = await createSupabaseServerClient();
  const [{ data: productsData }, { data: settings }] = await Promise.all([
    supabase.from("products").select("*").eq("is_published", true).order("created_at", { ascending: false }),
    supabase.from("settings").select("about_html").eq("id", 1).maybeSingle(),
  ]);
  const products = (productsData ?? []) as Product[];

  return (
    <>
      {/* Hero — horizontal chrome wordmark */}
      <section className="container-page pt-12 pb-10 md:pt-20 md:pb-16 flex flex-col items-center text-center">
        <BrandLogo
          src="/images/hvving-chrome.png"
          alt="hvving"
          className="w-[78vw] max-w-[760px] h-auto object-contain drop-shadow-chrome"
          fallbackClassName="text-6xl md:text-8xl"
        />
        <p className="eyebrow mt-6">— hvving · artist goods</p>
      </section>

      {/* Products with vertical gothic logo down the left (desktop) */}
      <section className="container-page grid grid-cols-1 md:grid-cols-[120px_1fr] lg:grid-cols-[160px_1fr] gap-6 md:gap-10">
        {/* Vertical logo column */}
        <aside className="hidden md:flex justify-center">
          <div className="sticky top-24 self-start py-4">
            <BrandLogo
              src="/images/hvving-vertical.png"
              alt="hvving"
              vertical
              className="h-[60vh] w-auto object-contain opacity-90 drop-shadow-chrome"
              fallbackClassName="text-5xl h-[60vh]"
            />
          </div>
        </aside>

        {/* Product area */}
        <div>
          <div className="flex items-center justify-between pb-6">
            <div className="eyebrow">Work · {products.length}</div>
            <ViewToggle current={isList ? "list" : "grid"} />
          </div>

          {isList ? (
            <ul className="divide-y divide-line border-y border-line">
              {products.map((p) => (
                <li key={p.id}>
                  <Link href={`/products/${p.slug}`} className="grid grid-cols-[88px_1fr_auto] gap-5 py-5 items-center hover:bg-velvetGlow/10 transition">
                    <div className="relative aspect-square bg-velvetDeep/50 overflow-hidden border border-line">
                      {p.thumbnail_url && <Image src={p.thumbnail_url} alt={p.name} fill className="object-cover" sizes="88px" />}
                    </div>
                    <div>
                      <div className="font-gothic text-2xl text-chrome leading-none">{p.name}</div>
                      {p.short_description && <div className="text-sm text-muted line-clamp-1 mt-2">{p.short_description}</div>}
                      <div className="flex gap-2 mt-2">
                        {p.is_set && <span className="text-[10px] tracking-widest2 uppercase border border-line px-2 py-0.5 text-muted">Set</span>}
                        {p.stock === 0 && <span className="text-[10px] tracking-widest2 uppercase border border-chrome/70 px-2 py-0.5 text-chrome">Sold out</span>}
                      </div>
                    </div>
                    <div className="text-right text-chrome">{formatKRW(p.price_krw)}</div>
                  </Link>
                </li>
              ))}
              {products.length === 0 && <li className="py-16 text-center text-muted">등록된 상품이 없습니다.</li>}
            </ul>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-12">
              {products.map((p) => (
                <Link key={p.id} href={`/products/${p.slug}`} className="group flex flex-col items-center text-center">
                  <div className="relative w-full aspect-square bg-velvetDeep/40 overflow-hidden border border-line">
                    {p.thumbnail_url && (
                      <Image
                        src={p.thumbnail_url}
                        alt={p.name}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-[1.04]"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    )}
                    {p.is_set && (
                      <span className="absolute top-2 left-2 text-[10px] tracking-widest2 uppercase bg-velvetDeep/70 border border-line px-2 py-0.5 text-chrome">Set</span>
                    )}
                    {p.stock === 0 && (
                      <span className="absolute top-2 right-2 text-[10px] tracking-widest2 uppercase bg-chrome text-velvetDeep px-2 py-0.5">Sold out</span>
                    )}
                  </div>
                  <div className="mt-3 font-gothic text-xl md:text-2xl text-chrome leading-none group-hover:chrome-text transition">{p.name}</div>
                  <div className="mt-1 text-sm text-muted">{formatKRW(p.price_krw)}</div>
                </Link>
              ))}
              {products.length === 0 && (
                <div className="col-span-full py-20 text-center text-muted">
                  등록된 상품이 없습니다.<br />관리자 페이지에서 상품을 추가해보세요.
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* About */}
      <section id="about" className="mt-28 border-t border-line">
        <div className="container-page py-20 md:py-24 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-3 eyebrow">— About</div>
          <div className="md:col-span-8">
            <h2 className="font-gothic chrome-text text-4xl md:text-6xl leading-tight mb-8">hvving</h2>
            {settings?.about_html ? (
              <div className="prose-store text-[15px] leading-relaxed" dangerouslySetInnerHTML={{ __html: settings.about_html }} />
            ) : (
              <div className="prose-store text-[15px] leading-relaxed text-muted">
                <p>아티스트 소개 글을 관리자 페이지에서 작성하세요.</p>
                <p>작업관, 작업 방향, 인터뷰, 외부 활동 링크 등을 자유롭게 채울 수 있습니다.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

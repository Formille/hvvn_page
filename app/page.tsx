import Link from "next/link";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatKRW } from "@/lib/format";
import type { Product } from "@/lib/types";
import { ViewToggle } from "@/components/view-toggle";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const isList = view === "list";

  const supabase = await createSupabaseServerClient();

  const [{ data: productsData }, { data: settings }] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false }),
    supabase.from("settings").select("about_html").eq("id", 1).maybeSingle(),
  ]);

  const products = (productsData ?? []) as Product[];

  return (
    <>
      {/* Hero */}
      <section className="container-page pt-16 pb-12 md:pt-24 md:pb-20">
        <div className="eyebrow mb-4">— Spring / 2026 Drop</div>
        <h1 className="h-display max-w-3xl">
          작은 것들의 기록.<br />
          <span className="italic text-muted">hvvn merchandise</span>
        </h1>
      </section>

      {/* Toolbar */}
      <div className="container-page flex items-end justify-between pb-6">
        <div className="eyebrow">All Products · {products.length}</div>
        <ViewToggle current={isList ? "list" : "grid"} />
      </div>

      {/* Product list */}
      {isList ? (
        <section className="container-page divide-y divide-line border-y border-line">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/products/${p.slug}`}
              className="grid grid-cols-[120px_1fr_auto] gap-6 py-5 items-center hover:bg-sand/40 transition"
            >
              <div className="relative aspect-square bg-sand overflow-hidden">
                {p.thumbnail_url && (
                  <Image src={p.thumbnail_url} alt={p.name} fill className="object-cover" sizes="120px" />
                )}
              </div>
              <div>
                <div className="font-serif text-xl">{p.name}</div>
                {p.short_description && (
                  <div className="text-sm text-muted line-clamp-1 mt-1">{p.short_description}</div>
                )}
                <div className="flex gap-2 mt-2">
                  {p.is_set && <span className="text-[10px] tracking-widest2 uppercase border border-line px-2 py-0.5">Set</span>}
                  {p.stock === 0 && <span className="text-[10px] tracking-widest2 uppercase border border-ink px-2 py-0.5">Sold out</span>}
                </div>
              </div>
              <div className="text-right">{formatKRW(p.price_krw)}</div>
            </Link>
          ))}
          {products.length === 0 && <div className="py-16 text-center text-muted">등록된 상품이 없습니다.</div>}
        </section>
      ) : (
        <section className="container-page grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12 pb-16">
          {products.map((p) => (
            <Link key={p.id} href={`/products/${p.slug}`} className="group">
              <div className="relative aspect-[4/5] bg-sand overflow-hidden">
                {p.thumbnail_url && (
                  <Image
                    src={p.thumbnail_url}
                    alt={p.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                )}
                {p.is_set && (
                  <span className="absolute top-3 left-3 text-[10px] tracking-widest2 uppercase bg-paper border border-line px-2 py-0.5">
                    Set
                  </span>
                )}
                {p.stock === 0 && (
                  <span className="absolute top-3 right-3 text-[10px] tracking-widest2 uppercase bg-ink text-paper px-2 py-0.5">
                    Sold out
                  </span>
                )}
              </div>
              <div className="mt-3 flex justify-between items-baseline gap-2">
                <div className="font-serif text-base leading-tight">{p.name}</div>
                <div className="text-sm">{formatKRW(p.price_krw)}</div>
              </div>
            </Link>
          ))}
          {products.length === 0 && (
            <div className="col-span-full py-20 text-center text-muted">
              등록된 상품이 없습니다.<br />관리자 페이지에서 상품을 추가해보세요.
            </div>
          )}
        </section>
      )}

      {/* About */}
      <section id="about" className="border-t border-line">
        <div className="container-page py-24 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-3 eyebrow">— About the artist</div>
          <div className="md:col-span-8">
            <h2 className="font-serif text-3xl md:text-5xl leading-tight mb-8">hvvn.</h2>
            {settings?.about_html ? (
              <div className="prose-store text-[15px] leading-relaxed" dangerouslySetInnerHTML={{ __html: settings.about_html }} />
            ) : (
              <div className="prose-store text-[15px] leading-relaxed text-muted">
                <p>아티스트 소개 글을 관리자 페이지에서 작성하세요.</p>
                <p>이 자리는 about 영역입니다. 작품관, 작업 방향, 인터뷰, 외부 활동 링크 등을 자유롭게 채울 수 있습니다.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

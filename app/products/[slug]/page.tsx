import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatKRW } from "@/lib/format";
import type { Product, ProductImage } from "@/lib/types";
import { ProductActions } from "@/components/product-actions";
import { WaitlistForm } from "@/components/waitlist-form";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle<Product>();

  if (!product) notFound();

  const { data: images } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", product.id)
    .order("position", { ascending: true });

  const imgs = (images ?? []) as ProductImage[];

  let setMembers: Product[] = [];
  if (product.is_set) {
    const { data: setItems } = await supabase
      .from("product_set_items")
      .select("member_id, position, products:member_id(*)")
      .eq("set_id", product.id)
      .order("position", { ascending: true });
    setMembers = ((setItems ?? []) as Array<{ products: Product | Product[] | null }>)
      .flatMap((row) => (Array.isArray(row.products) ? row.products : row.products ? [row.products] : []));
  }

  return (
    <article className="container-page pt-12 pb-24 grid md:grid-cols-2 gap-12">
      {/* Gallery */}
      <div className="space-y-3">
        <div className="relative aspect-[4/5] bg-sand overflow-hidden">
          {product.thumbnail_url && (
            <Image src={product.thumbnail_url} alt={product.name} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 50vw" />
          )}
        </div>
        {imgs.length > 0 && (
          <div className="grid grid-cols-4 gap-3">
            {imgs.map((img) => (
              <div key={img.id} className="relative aspect-square bg-sand">
                <Image src={img.url} alt={img.alt ?? ""} fill className="object-cover" sizes="120px" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="md:sticky md:top-24 self-start">
        <div className="eyebrow mb-3">{product.is_set ? "Set" : "Item"}</div>
        <h1 className="font-serif text-3xl md:text-4xl leading-tight">{product.name}</h1>
        <div className="mt-4 text-xl">{formatKRW(product.price_krw)}</div>

        {product.short_description && (
          <p className="mt-6 text-[14px] text-muted leading-relaxed">{product.short_description}</p>
        )}

        <div className="mt-8 hairline" />

        {/* Set member links (자동 노출) */}
        {product.is_set && setMembers.length > 0 && (
          <div className="mt-6">
            <div className="eyebrow mb-3">— Set 구성</div>
            <ul className="space-y-1 text-sm">
              {setMembers.map((m) => (
                <li key={m.id}>
                  <Link href={`/products/${m.slug}`} className="underline underline-offset-2 hover:text-ink/60">
                    {m.name}
                  </Link>
                  <span className="text-muted"> · {formatKRW(m.price_krw)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8">
          {product.stock > 0 ? (
            <ProductActions product={product} />
          ) : (
            <div className="space-y-4">
              <div className="text-[12px] tracking-widest2 uppercase border border-ink px-3 py-2 inline-block">Sold out</div>
              <div className="text-sm text-muted">재입고 알림을 받으시려면 이메일을 등록해주세요.</div>
              <WaitlistForm productId={product.id} />
            </div>
          )}
        </div>

        {product.description_html && (
          <div className="mt-12">
            <div className="eyebrow mb-3">— Details</div>
            <div className="prose-store text-[14px]" dangerouslySetInnerHTML={{ __html: product.description_html }} />
          </div>
        )}
      </div>
    </article>
  );
}

import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/product-form";
import type { Product, ProductImage } from "@/lib/types";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createSupabaseServerClient();
  const { data: product } = await sb.from("products").select("*").eq("id", id).maybeSingle<Product>();
  if (!product) notFound();
  const { data: images } = await sb.from("product_images").select("*").eq("product_id", id).order("position");

  return (
    <div>
      <h2 className="font-serif text-2xl mb-6">상품 수정 · <span className="font-mono text-sm text-muted">{product.slug}</span></h2>
      <ProductForm initial={product} initialImages={(images ?? []) as ProductImage[]} />
    </div>
  );
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";

const Schema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  price_krw: z.number().int().nonnegative(),
  short_description: z.string().optional().nullable(),
  description_html: z.string().optional().nullable(),
  stock: z.number().int().nonnegative(),
  is_published: z.boolean(),
  thumbnail_url: z.string().optional().nullable(),
  is_set: z.boolean().optional(),
  images: z.array(z.object({ url: z.string(), alt: z.string().optional().nullable(), position: z.number() })).optional(),
  set_member_ids: z.array(z.string().uuid()).optional(),
});

export async function POST(req: Request) {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = Schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "잘못된 입력", issues: parsed.error.issues }, { status: 400 });
  const { images, set_member_ids, ...productData } = parsed.data;

  const svc = createSupabaseServiceClient();
  const { data, error } = await svc
    .from("products")
    .insert({
      ...productData,
      is_set: !!productData.is_set,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (images && images.length > 0) {
    await svc.from("product_images").insert(images.map((i) => ({ ...i, product_id: data.id })));
  }
  if (productData.is_set && set_member_ids && set_member_ids.length > 0) {
    await svc.from("product_set_items").insert(
      set_member_ids.map((mid, idx) => ({ set_id: data.id, member_id: mid, position: idx }))
    );
  }

  return NextResponse.json({ id: data.id });
}

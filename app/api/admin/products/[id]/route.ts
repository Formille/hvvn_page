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
  images: z.array(z.object({ url: z.string(), alt: z.string().optional().nullable(), position: z.number() })).optional(),
  set_member_ids: z.array(z.string().uuid()).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = Schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "잘못된 입력" }, { status: 400 });
  const { images, set_member_ids, ...patch } = parsed.data;

  const svc = createSupabaseServiceClient();
  const { error } = await svc
    .from("products")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (images) {
    await svc.from("product_images").delete().eq("product_id", id);
    if (images.length > 0) {
      await svc.from("product_images").insert(images.map((i) => ({ ...i, product_id: id })));
    }
  }
  if (set_member_ids) {
    await svc.from("product_set_items").delete().eq("set_id", id);
    if (set_member_ids.length > 0) {
      await svc.from("product_set_items").insert(set_member_ids.map((mid, idx) => ({ set_id: id, member_id: mid, position: idx })));
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const svc = createSupabaseServiceClient();
  const { error } = await svc.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

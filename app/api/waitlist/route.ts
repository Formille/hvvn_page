import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const Schema = z.object({ product_id: z.string().uuid(), email: z.string().email() });

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = Schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "잘못된 입력입니다." }, { status: 400 });

  const sb = createSupabaseServiceClient();
  const { error } = await sb
    .from("waitlist")
    .upsert({ product_id: parsed.data.product_id, email: parsed.data.email }, { onConflict: "product_id,email" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

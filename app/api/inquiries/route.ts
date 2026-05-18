import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const Schema = z.object({
  order_id: z.string().uuid().optional(),
  customer_name: z.string().min(1),
  customer_phone: z.string().optional(),
  customer_email: z.string().email(),
  message: z.string().min(1),
});

export async function POST(req: Request) {
  const parsed = Schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "잘못된 입력" }, { status: 400 });

  const sb = createSupabaseServiceClient();
  const { error } = await sb.from("inquiries").insert({
    order_id: parsed.data.order_id ?? null,
    customer_name: parsed.data.customer_name,
    customer_phone: parsed.data.customer_phone ?? null,
    customer_email: parsed.data.customer_email,
    message: parsed.data.message,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

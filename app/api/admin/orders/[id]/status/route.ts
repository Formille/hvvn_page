import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";

const Schema = z.object({
  status: z.enum(["pending_payment", "paid", "shipping", "delivered", "cancelled"]),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = Schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "잘못된 입력" }, { status: 400 });

  const patch: Record<string, unknown> = { status: parsed.data.status };
  if (parsed.data.status === "paid") patch.paid_at = new Date().toISOString();
  if (parsed.data.status === "shipping") patch.shipped_at = new Date().toISOString();
  if (parsed.data.status === "delivered") patch.delivered_at = new Date().toISOString();

  const svc = createSupabaseServiceClient();
  const { error } = await svc.from("orders").update(patch).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { sendGmail } from "@/lib/integrations/google";

const Schema = z.object({
  send_email: z.boolean(),
  product_name: z.string(),
  product_slug: z.string(),
  email: z.string().email(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = Schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "잘못된 입력" }, { status: 400 });

  const svc = createSupabaseServiceClient();

  if (parsed.data.send_email) {
    const { data: integ } = await svc.from("integrations").select("*").eq("provider", "google").maybeSingle();
    if (!integ?.access_token || !integ?.account_email) {
      return NextResponse.json({ error: "Google 연동이 필요합니다." }, { status: 400 });
    }
    const origin = req.headers.get("origin") ?? "";
    await sendGmail({
      accessToken: integ.access_token,
      from: integ.account_email,
      to: parsed.data.email,
      subject: `[hvvn] ${parsed.data.product_name} 재입고 안내`,
      body: `안녕하세요. 신청해주셨던 "${parsed.data.product_name}" 이 재입고되었습니다.\n\n${origin}/products/${parsed.data.product_slug}\n\n감사합니다.\nhvvn.`,
    });
  }

  const { error } = await svc.from("waitlist").update({ notified_at: new Date().toISOString() }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

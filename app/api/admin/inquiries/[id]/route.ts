import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { sendGmail } from "@/lib/integrations/google";

const Schema = z.object({
  answer: z.string().min(1),
  status: z.enum(["answered", "closed"]),
  send_via_gmail: z.boolean().optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = Schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "잘못된 입력" }, { status: 400 });

  const svc = createSupabaseServiceClient();
  const { data: inq } = await svc.from("inquiries").select("*").eq("id", id).maybeSingle();
  if (!inq) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (parsed.data.send_via_gmail) {
    const { data: integ } = await svc.from("integrations").select("*").eq("provider", "google").maybeSingle();
    if (!integ?.access_token || !integ?.account_email) {
      return NextResponse.json({ error: "Google 연동이 필요합니다." }, { status: 400 });
    }
    try {
      await sendGmail({
        accessToken: integ.access_token,
        from: integ.account_email,
        to: inq.customer_email,
        subject: `[hvvn] 문의 답변 드립니다`,
        body: parsed.data.answer,
      });
    } catch (e: any) {
      return NextResponse.json({ error: `Gmail 발송 실패: ${e.message}` }, { status: 500 });
    }
  }

  const { error } = await svc.from("inquiries").update({
    answer: parsed.data.answer,
    status: parsed.data.status,
    answered_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

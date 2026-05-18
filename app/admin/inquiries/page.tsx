import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import { InquiryRow } from "@/components/inquiry-row";

export default async function AdminInquiriesPage() {
  const sb = await createSupabaseServerClient();
  const { data } = await sb
    .from("inquiries")
    .select("*, orders(order_number)")
    .order("created_at", { ascending: false })
    .limit(200);
  const { data: integration } = await sb
    .from("integrations")
    .select("provider, account_email, expires_at")
    .eq("provider", "google")
    .maybeSingle();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-serif text-2xl">문의</h2>
        <div className="text-sm">
          {integration?.account_email ? (
            <span>Gmail 연동: <span className="font-medium">{integration.account_email}</span></span>
          ) : (
            <a href="/admin/integrations" className="underline">Gmail 연동 안내</a>
          )}
        </div>
      </div>

      <ul className="space-y-4">
        {(data ?? []).map((i: any) => (
          <InquiryRow key={i.id} inquiry={i} />
        ))}
        {(data ?? []).length === 0 && <li className="py-12 text-center text-muted">문의가 없습니다.</li>}
      </ul>
    </div>
  );
}

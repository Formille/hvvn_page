import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import { MarkNotifiedButton } from "@/components/mark-notified-button";

export default async function WaitlistPage() {
  const sb = await createSupabaseServerClient();
  const { data } = await sb
    .from("waitlist")
    .select("*, products(name, slug, stock)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h2 className="font-serif text-2xl mb-6">재입고 알림 대기</h2>
      <p className="text-sm text-muted mb-6">상품 재고를 채우면 이 페이지에서 알림 발송을 표시할 수 있습니다. (Gmail 연동 시 자동 발송 옵션 활성)</p>
      <table className="w-full text-sm">
        <thead className="text-[11px] tracking-widest2 uppercase text-muted">
          <tr className="text-left border-b border-line">
            <th className="py-3 pr-3">상품</th>
            <th className="py-3 pr-3">이메일</th>
            <th className="py-3 pr-3">신청일시</th>
            <th className="py-3 pr-3">재고</th>
            <th className="py-3 pr-3">상태</th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((w: any) => (
            <tr key={w.id} className="border-b border-line">
              <td className="py-3 pr-3">{w.products?.name}</td>
              <td className="py-3 pr-3 font-mono text-xs">{w.email}</td>
              <td className="py-3 pr-3 text-muted">{formatDate(w.created_at)}</td>
              <td className="py-3 pr-3">{w.products?.stock}</td>
              <td className="py-3 pr-3">
                {w.notified_at ? (
                  <span className="text-xs text-muted">{formatDate(w.notified_at)} 알림 완료</span>
                ) : (
                  <MarkNotifiedButton id={w.id} email={w.email} productName={w.products?.name ?? ""} productSlug={w.products?.slug ?? ""} />
                )}
              </td>
            </tr>
          ))}
          {(data ?? []).length === 0 && (
            <tr><td colSpan={5} className="py-12 text-center text-muted">대기자가 없습니다.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

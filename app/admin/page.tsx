import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatKRW } from "@/lib/format";

export default async function AdminDashboard() {
  const sb = await createSupabaseServerClient();
  const [pending, products, lowStock, openInq, waitlist] = await Promise.all([
    sb.from("orders").select("id, total_krw", { count: "exact" }).eq("status", "pending_payment"),
    sb.from("products").select("id", { count: "exact" }),
    sb.from("products").select("id, name, stock").lte("stock", 3).order("stock", { ascending: true }).limit(5),
    sb.from("inquiries").select("id", { count: "exact" }).eq("status", "open"),
    sb.from("waitlist").select("id", { count: "exact" }).is("notified_at", null),
  ]);

  const pendingTotal = (pending.data ?? []).reduce((s, o) => s + (o.total_krw ?? 0), 0);

  return (
    <div className="grid md:grid-cols-4 gap-6">
      <Card title="입금 대기 주문" value={String(pending.count ?? 0)} sub={formatKRW(pendingTotal)} href="/admin/orders?status=pending_payment" />
      <Card title="등록 상품" value={String(products.count ?? 0)} href="/admin/products" />
      <Card title="미답변 문의" value={String(openInq.count ?? 0)} href="/admin/inquiries" />
      <Card title="재입고 알림 대기" value={String(waitlist.count ?? 0)} href="/admin/waitlist" />

      <div className="md:col-span-2 border border-line p-6">
        <div className="eyebrow mb-3">— Low stock</div>
        <ul className="divide-y divide-line">
          {(lowStock.data ?? []).map((p) => (
            <li key={p.id} className="py-2 flex justify-between text-sm">
              <Link href={`/admin/products/${p.id}/edit`} className="underline">{p.name}</Link>
              <span className={p.stock === 0 ? "text-accent" : ""}>재고 {p.stock}</span>
            </li>
          ))}
          {(lowStock.data ?? []).length === 0 && <li className="py-2 text-sm text-muted">재고 부족 상품 없음</li>}
        </ul>
      </div>

      <div className="md:col-span-2 border border-line p-6">
        <div className="eyebrow mb-3">— Quick actions</div>
        <ul className="space-y-2 text-sm">
          <li><Link href="/admin/products/new" className="underline">+ 새 상품 등록</Link></li>
          <li><Link href="/admin/sets/new" className="underline">+ 새 세트 상품 만들기</Link></li>
          <li><Link href="/admin/settings" className="underline">계좌·배송비·About 수정</Link></li>
          <li><Link href="/admin/integrations" className="underline">Google 연동 (Gmail · Drive)</Link></li>
        </ul>
      </div>
    </div>
  );
}

function Card({ title, value, sub, href }: { title: string; value: string; sub?: string; href?: string }) {
  const inner = (
    <div className="border border-line p-6 h-full">
      <div className="eyebrow">{title}</div>
      <div className="font-serif text-4xl mt-2">{value}</div>
      {sub && <div className="text-xs text-muted mt-1">{sub}</div>}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

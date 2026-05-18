import Link from "next/link";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { formatKRW, formatDate } from "@/lib/format";
import { ORDER_STATUS_LABEL, type Order, type OrderStatus } from "@/lib/types";
import { OrderStatusSelect } from "@/components/order-status-select";

const STATUSES: OrderStatus[] = ["pending_payment", "paid", "shipping", "delivered", "cancelled"];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const sb = createSupabaseServiceClient();
  let q = sb.from("orders").select("*").order("created_at", { ascending: false }).limit(200);
  if (status && STATUSES.includes(status as OrderStatus)) q = q.eq("status", status);
  const { data: orders } = await q;
  const list = (orders ?? []) as Order[];

  return (
    <div>
      <div className="flex gap-2 mb-6 flex-wrap">
        <Link href="/admin/orders" className={`text-xs tracking-widest2 uppercase border px-3 py-1 ${!status ? "border-ink" : "border-line text-muted"}`}>All</Link>
        {STATUSES.map((s) => (
          <Link key={s} href={`/admin/orders?status=${s}`} className={`text-xs tracking-widest2 uppercase border px-3 py-1 ${status === s ? "border-ink" : "border-line text-muted"}`}>
            {ORDER_STATUS_LABEL[s]}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-[11px] tracking-widest2 uppercase text-muted">
            <tr className="text-left border-b border-line">
              <th className="py-3 pr-3">주문번호</th>
              <th className="py-3 pr-3">주문일시</th>
              <th className="py-3 pr-3">주문자</th>
              <th className="py-3 pr-3">입금자</th>
              <th className="py-3 pr-3 text-right">합계</th>
              <th className="py-3 pr-3">상태</th>
            </tr>
          </thead>
          <tbody>
            {list.map((o) => (
              <tr key={o.id} className="border-b border-line hover:bg-sand/30">
                <td className="py-3 pr-3 font-mono"><Link href={`/admin/orders/${o.id}`} className="underline">{o.order_number}</Link></td>
                <td className="py-3 pr-3 text-muted">{formatDate(o.created_at)}</td>
                <td className="py-3 pr-3">{o.customer_name} · {o.customer_phone}</td>
                <td className="py-3 pr-3">{o.depositor_name}</td>
                <td className="py-3 pr-3 text-right">{formatKRW(o.total_krw)}</td>
                <td className="py-3 pr-3"><OrderStatusSelect orderId={o.id} status={o.status} /></td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan={6} className="py-12 text-center text-muted">주문 내역이 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

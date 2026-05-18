import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatKRW, formatDate } from "@/lib/format";
import { ORDER_STATUS_LABEL, type Order, type OrderItem } from "@/lib/types";
import { OrderStatusSelect } from "@/components/order-status-select";

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createSupabaseServerClient();
  const { data: order } = await sb.from("orders").select("*").eq("id", id).maybeSingle<Order>();
  if (!order) notFound();
  const { data: items } = await sb.from("order_items").select("*").eq("order_id", id);

  return (
    <div>
      <Link href="/admin/orders" className="btn-ghost px-0 underline">← 주문 목록</Link>
      <div className="grid md:grid-cols-3 gap-10 mt-6">
        <div className="md:col-span-2 space-y-8">
          <div>
            <div className="eyebrow">— Order</div>
            <h2 className="font-serif text-3xl mt-1">{order.order_number}</h2>
            <div className="text-sm text-muted">{formatDate(order.created_at)}</div>
          </div>

          <Section title="주문자">
            <Row k="이름" v={order.customer_name} />
            <Row k="전화" v={order.customer_phone} />
            <Row k="이메일" v={order.customer_email ?? "-"} />
            <Row k="입금자명" v={order.depositor_name} />
          </Section>

          <Section title="배송지">
            <Row k="우편번호" v={order.shipping_postcode} />
            <Row k="주소" v={`${order.shipping_address1} ${order.shipping_address2 ?? ""}`} />
            <Row k="메모" v={order.shipping_memo ?? "-"} />
            <Row k="제주/도서산간" v={order.is_remote_area ? "예" : "아니오"} />
          </Section>

          <Section title="주문 상품">
            <table className="w-full text-sm">
              <thead className="text-[11px] tracking-widest2 uppercase text-muted">
                <tr><th className="text-left py-2">상품</th><th className="text-right">수량</th><th className="text-right">단가</th><th className="text-right">합계</th></tr>
              </thead>
              <tbody>
                {(items ?? []).map((it: OrderItem) => (
                  <tr key={it.id} className="border-t border-line">
                    <td className="py-2">{it.product_name_snapshot}</td>
                    <td className="text-right">{it.quantity}</td>
                    <td className="text-right">{formatKRW(it.unit_price_krw)}</td>
                    <td className="text-right">{formatKRW(it.unit_price_krw * it.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex justify-between text-sm"><span className="text-muted">소계</span><span>{formatKRW(order.subtotal_krw)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted">배송비</span><span>{formatKRW(order.shipping_fee_krw)}</span></div>
            <div className="flex justify-between text-base mt-1"><span>합계</span><span className="font-medium">{formatKRW(order.total_krw)}</span></div>
          </Section>
        </div>

        <aside className="md:col-span-1 space-y-6">
          <div className="border border-line p-5">
            <div className="eyebrow mb-2">— 상태</div>
            <div className="mb-3 text-sm">현재: {ORDER_STATUS_LABEL[order.status]}</div>
            <OrderStatusSelect orderId={order.id} status={order.status} />
            <div className="text-xs text-muted mt-3 space-y-1">
              {order.paid_at && <div>입금확인 {formatDate(order.paid_at)}</div>}
              {order.shipped_at && <div>배송시작 {formatDate(order.shipped_at)}</div>}
              {order.delivered_at && <div>배송완료 {formatDate(order.delivered_at)}</div>}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-line p-5">
      <div className="eyebrow mb-3">— {title}</div>
      {children}
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] text-sm py-1">
      <span className="text-muted">{k}</span>
      <span>{v}</span>
    </div>
  );
}

import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatKRW } from "@/lib/format";
import type { Order, OrderItem, Settings } from "@/lib/types";

export default async function CompletePage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderNumber } = await searchParams;
  if (!orderNumber) {
    return <div className="container-page py-24 text-center text-muted">잘못된 접근입니다.</div>;
  }

  const supabase = await createSupabaseServerClient();
  const [{ data: order }, { data: settings }] = await Promise.all([
    supabase.from("orders").select("*").eq("order_number", orderNumber).maybeSingle<Order>(),
    supabase.from("settings").select("*").eq("id", 1).maybeSingle<Settings>(),
  ]);

  if (!order) {
    return <div className="container-page py-24 text-center text-muted">주문 정보를 찾을 수 없습니다.</div>;
  }

  const { data: items } = await supabase.from("order_items").select("*").eq("order_id", order.id);
  const orderItems = (items ?? []) as OrderItem[];

  return (
    <div className="container-page py-16 max-w-2xl">
      <div className="eyebrow mb-3">— Order placed</div>
      <h1 className="chrome-text text-4xl md:text-5xl mb-2">주문이 접수되었습니다.</h1>
      <p className="text-muted">아래 계좌로 입금이 확인되면 배송이 시작됩니다.</p>

      <div className="hairline my-10" />

      <div className="grid grid-cols-2 gap-y-4 text-sm">
        <div className="text-muted">주문번호</div>
        <div className="font-mono">{order.order_number}</div>
        <div className="text-muted">주문일시</div>
        <div>{new Date(order.created_at).toLocaleString("ko-KR")}</div>
        <div className="text-muted">결제금액</div>
        <div className="text-lg">{formatKRW(order.total_krw)}</div>
        <div className="text-muted">입금자명</div>
        <div>{order.depositor_name}</div>
      </div>

      <div className="hairline my-10" />

      <div className="border border-line bg-sand/40 p-6">
        <div className="eyebrow mb-3">— Bank transfer</div>
        {settings?.bank_account_number ? (
          <>
            <div className="font-serif text-2xl">{settings.bank_name}</div>
            <div className="font-mono text-2xl tracking-wider mt-1 select-all">{settings.bank_account_number}</div>
            <div className="text-sm text-muted mt-1">예금주 {settings.bank_account_holder}</div>
            <p className="text-xs text-muted mt-4">
              주문 후 3일 이내 입금되지 않으면 자동 취소될 수 있습니다.<br />
              입금자명이 다를 경우 주문번호({order.order_number})를 메모로 함께 입력해주세요.
            </p>
          </>
        ) : (
          <div className="text-sm text-muted">관리자가 계좌 정보를 등록해야 합니다.</div>
        )}
      </div>

      <div className="hairline my-10" />

      <div>
        <div className="eyebrow mb-3">— Items</div>
        <ul className="divide-y divide-line border-y border-line">
          {orderItems.map((it) => (
            <li key={it.id} className="py-3 flex justify-between text-sm">
              <span>{it.product_name_snapshot} × {it.quantity}</span>
              <span>{formatKRW(it.unit_price_krw * it.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between text-sm mt-4">
          <span className="text-muted">배송비</span>
          <span>{formatKRW(order.shipping_fee_krw)}</span>
        </div>
        <div className="flex justify-between mt-2 text-base">
          <span>합계</span>
          <span className="font-medium">{formatKRW(order.total_krw)}</span>
        </div>
      </div>

      <div className="mt-10 flex gap-2">
        <Link href={`/orders?name=${encodeURIComponent(order.customer_name)}&phone=${order.customer_phone}`} className="btn-outline">
          주문 조회하기
        </Link>
        <Link href="/" className="btn">계속 쇼핑하기</Link>
      </div>
    </div>
  );
}

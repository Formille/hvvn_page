"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatKRW, formatDate } from "@/lib/format";
import { ORDER_STATUS_LABEL, type Order, type OrderItem } from "@/lib/types";

type Result = Order & { items: OrderItem[] };

export default function OrdersPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [results, setResults] = useState<Result[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inquiryFor, setInquiryFor] = useState<string | null>(null);

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const n = sp.get("name");
    const p = sp.get("phone");
    if (n && p) {
      setName(n);
      setPhone(p);
      search(n, p);
    }
  }, []);

  async function search(n = name, p = phone) {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/orders/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: n, phone: p }),
    });
    const j = await res.json();
    if (!res.ok) {
      setError(j.error ?? "조회 실패");
      setLoading(false);
      return;
    }
    setResults(j.orders);
    setLoading(false);
  }

  return (
    <div className="container-page py-12 md:py-16 max-w-3xl">
      <div className="eyebrow mb-2">— Orders</div>
      <h1 className="font-gothic chrome-text text-4xl md:text-6xl mb-10">orders</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          search();
        }}
        className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-4 sm:gap-3 sm:items-end"
      >
        <label>
          <span className="label">이름</span>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          <span className="label">전화번호</span>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="01012345678" />
        </label>
        <button className="btn w-full sm:w-auto">조회</button>
      </form>
      {error && <div className="mt-4 text-sm text-accent">{error}</div>}

      {loading && <div className="mt-12 text-muted">조회 중…</div>}

      {results && results.length === 0 && (
        <div className="mt-16 text-center text-muted">주문 내역이 없습니다.</div>
      )}

      {results && results.length > 0 && (
        <ul className="mt-12 space-y-6">
          {results.map((o) => (
            <li key={o.id} className="border border-line p-5 sm:p-6">
              <div className="flex justify-between items-start gap-3 mb-4">
                <div>
                  <div className="font-mono text-sm text-chrome">{o.order_number}</div>
                  <div className="text-xs text-muted">{formatDate(o.created_at)}</div>
                </div>
                <div className="text-[11px] tracking-widest2 uppercase border border-chrome/60 text-chrome px-2 py-1 whitespace-nowrap">
                  {ORDER_STATUS_LABEL[o.status]}
                </div>
              </div>
              <ul className="text-sm divide-y divide-line">
                {o.items.map((it) => (
                  <li key={it.id} className="py-2 flex justify-between">
                    <span>{it.product_name_snapshot} × {it.quantity}</span>
                    <span>{formatKRW(it.unit_price_krw * it.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between mt-3 text-sm">
                <span className="text-muted">배송비</span>
                <span>{formatKRW(o.shipping_fee_krw)}</span>
              </div>
              <div className="flex justify-between text-base mt-1">
                <span>합계</span>
                <span className="font-medium">{formatKRW(o.total_krw)}</span>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => setInquiryFor(inquiryFor === o.id ? null : o.id)} className="btn-ghost px-0 underline">
                  {inquiryFor === o.id ? "문의 닫기" : "관리자에게 문의"}
                </button>
              </div>
              {inquiryFor === o.id && (
                <InquiryForm orderId={o.id} customerName={o.customer_name} customerPhone={o.customer_phone} email={o.customer_email} />
              )}
            </li>
          ))}
        </ul>
      )}

      {!results && (
        <div className="mt-12 text-sm text-muted">
          주문 시 입력한 이름과 전화번호를 그대로 입력하면 모든 주문을 확인할 수 있습니다.
        </div>
      )}

      <div className="mt-16 text-xs text-muted">
        주문 내역이 보이지 않으면 <Link href="/" className="underline">홈</Link>으로 돌아가서 다시 시도해주세요.
      </div>
    </div>
  );
}

function InquiryForm({ orderId, customerName, customerPhone, email }: { orderId: string; customerName: string; customerPhone: string; email: string | null }) {
  const [msg, setMsg] = useState("");
  const [emailVal, setEmailVal] = useState(email ?? "");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const res = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_id: orderId,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: emailVal,
        message: msg,
      }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j.error ?? "전송 실패");
      setStatus("error");
      return;
    }
    setStatus("ok");
  }

  if (status === "ok") {
    return <div className="mt-4 text-sm">문의가 접수되었습니다. 관리자가 이메일로 답변드릴게요.</div>;
  }

  return (
    <form onSubmit={send} className="mt-4 space-y-3 border border-line p-4">
      <label className="block">
        <span className="label">이메일 (답변 받을 주소)</span>
        <input className="input" type="email" required value={emailVal} onChange={(e) => setEmailVal(e.target.value)} />
      </label>
      <label className="block">
        <span className="label">문의 내용</span>
        <textarea className="input-box" rows={4} required value={msg} onChange={(e) => setMsg(e.target.value)} />
      </label>
      {err && <div className="text-xs text-accent">{err}</div>}
      <button className="btn-outline w-full sm:w-auto" disabled={status === "sending"}>{status === "sending" ? "..." : "문의 보내기"}</button>
    </form>
  );
}

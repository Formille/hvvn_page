"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { formatKRW, isRemoteArea } from "@/lib/format";

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const lines = useCart((s) => s.lines);
  const subtotal = useCart((s) => s.subtotal());
  const clear = useCart((s) => s.clear);

  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    shipping_postcode: "",
    shipping_address1: "",
    shipping_address2: "",
    shipping_memo: "",
    depositor_name: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (mounted && lines.length === 0) router.replace("/cart");
  }, [mounted, lines.length, router]);

  const remote = useMemo(() => isRemoteArea(form.shipping_postcode), [form.shipping_postcode]);
  const [fees, setFees] = useState({ default: 4000, remote: 7000 });
  useEffect(() => {
    fetch("/api/settings/shipping").then((r) => r.json()).then((d) => setFees(d)).catch(() => {});
  }, []);
  const shippingFee = remote ? fees.remote : fees.default;
  const total = subtotal + shippingFee;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        items: lines.map((l) => ({
          product_id: l.product_id,
          name: l.name,
          unit_price_krw: l.price_krw,
          quantity: l.quantity,
        })),
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "주문 처리 중 오류가 발생했습니다.");
      setSubmitting(false);
      return;
    }
    clear();
    router.push(`/checkout/complete?order=${json.order_number}`);
  }

  if (!mounted || lines.length === 0) return null;

  return (
    <div className="container-page py-16 grid md:grid-cols-3 gap-10">
      <form onSubmit={submit} className="md:col-span-2 space-y-10">
        <div>
          <div className="eyebrow mb-3">— Step 1</div>
          <h1 className="chrome-text text-3xl md:text-4xl mb-6">주문자 정보</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <Field label="이름" required value={form.customer_name} onChange={(v) => setForm({ ...form, customer_name: v })} />
            <Field label="전화번호" required value={form.customer_phone} onChange={(v) => setForm({ ...form, customer_phone: v })} placeholder="01012345678" />
            <Field label="이메일" type="email" value={form.customer_email} onChange={(v) => setForm({ ...form, customer_email: v })} placeholder="주문 확인용 (선택)" className="sm:col-span-2" />
          </div>
        </div>

        <div>
          <div className="eyebrow mb-3">— Step 2</div>
          <h2 className="chrome-text text-3xl md:text-4xl mb-6">배송지</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <Field label="우편번호" required value={form.shipping_postcode} onChange={(v) => setForm({ ...form, shipping_postcode: v })} placeholder="5자리" />
            <div className="hidden sm:block" />
            <Field label="주소" required value={form.shipping_address1} onChange={(v) => setForm({ ...form, shipping_address1: v })} className="sm:col-span-2" />
            <Field label="상세주소" value={form.shipping_address2} onChange={(v) => setForm({ ...form, shipping_address2: v })} className="sm:col-span-2" />
            <Field label="배송 메모" value={form.shipping_memo} onChange={(v) => setForm({ ...form, shipping_memo: v })} className="sm:col-span-2" />
          </div>
          {remote && (
            <div className="mt-3 text-xs text-accent">제주/도서산간 지역으로 배송비가 {formatKRW(fees.remote)}으로 적용됩니다.</div>
          )}
        </div>

        <div>
          <div className="eyebrow mb-3">— Step 3</div>
          <h2 className="chrome-text text-3xl md:text-4xl mb-6">결제 (무통장입금)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <Field label="입금자명" required value={form.depositor_name} onChange={(v) => setForm({ ...form, depositor_name: v })} />
          </div>
          <p className="text-xs text-muted mt-3">
            주문 완료 후 안내되는 계좌로 입금해주세요. 입금자명이 다른 경우 주문 확인이 늦어질 수 있습니다.
          </p>
        </div>

        {error && <div className="text-sm text-accent">{error}</div>}

        <button disabled={submitting} className="btn w-full">
          {submitting ? "Processing..." : `${formatKRW(total)} 주문하기`}
        </button>
      </form>

      <aside>
        <div className="border border-line p-6 sticky top-24">
          <div className="eyebrow mb-3">— Summary</div>
          <ul className="divide-y divide-line">
            {lines.map((l) => (
              <li key={l.product_id} className="py-3 flex justify-between text-sm">
                <span className="truncate pr-2">{l.name} × {l.quantity}</span>
                <span>{formatKRW(l.price_krw * l.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between text-sm mt-4">
            <span className="text-muted">상품 합계</span>
            <span>{formatKRW(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-muted">배송비 {remote ? "(제주/도서산간)" : ""}</span>
            <span>{formatKRW(shippingFee)}</span>
          </div>
          <div className="hairline my-3" />
          <div className="flex justify-between text-base">
            <span>합계</span>
            <span className="font-medium">{formatKRW(total)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="label">{label}{required && " *"}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input"
      />
    </label>
  );
}

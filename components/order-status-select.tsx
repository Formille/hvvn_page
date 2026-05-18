"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = ["pending_payment", "paid", "shipping", "delivered", "cancelled"];

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [value, setValue] = useState<OrderStatus>(status);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function update(next: OrderStatus) {
    setValue(next);
    const res = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error ?? "변경 실패");
      setValue(status);
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <select
      value={value}
      disabled={pending}
      onChange={(e) => update(e.target.value as OrderStatus)}
      className="bg-paper border border-line px-2 py-1 text-sm"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>
      ))}
    </select>
  );
}

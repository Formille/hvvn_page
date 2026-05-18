"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function MarkNotifiedButton({ id, email, productName, productSlug }: { id: string; email: string; productName: string; productSlug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function mark(sendEmail: boolean) {
    setLoading(true);
    const res = await fetch(`/api/admin/waitlist/${id}/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ send_email: sendEmail, product_name: productName, product_slug: productSlug, email }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error ?? "실패");
      setLoading(false);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button onClick={() => mark(false)} className="text-xs underline" disabled={loading}>완료 표시</button>
      <button onClick={() => mark(true)} className="text-xs underline" disabled={loading}>Gmail로 발송</button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/format";

const STATUS_LABEL: Record<string, string> = { open: "미답변", answered: "답변완료", closed: "닫힘" };

export function InquiryRow({ inquiry }: { inquiry: any }) {
  const router = useRouter();
  const [answer, setAnswer] = useState(inquiry.answer ?? "");
  const [sending, setSending] = useState(false);
  const [sendViaGmail, setSendViaGmail] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save(close = false) {
    setSending(true);
    setErr(null);
    const res = await fetch(`/api/admin/inquiries/${inquiry.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answer,
        status: close ? "closed" : "answered",
        send_via_gmail: sendViaGmail,
      }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j.error ?? "저장 실패");
      setSending(false);
      return;
    }
    setSending(false);
    router.refresh();
  }

  return (
    <li className="border border-line p-5">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="font-medium">{inquiry.customer_name} <span className="text-muted text-sm">· {inquiry.customer_email}</span></div>
          <div className="text-xs text-muted">{formatDate(inquiry.created_at)} {inquiry.orders?.order_number && `· 주문 ${inquiry.orders.order_number}`}</div>
        </div>
        <span className="text-[11px] tracking-widest2 uppercase border border-line px-2 py-0.5">{STATUS_LABEL[inquiry.status]}</span>
      </div>
      <p className="text-sm whitespace-pre-wrap bg-sand/30 p-3">{inquiry.message}</p>

      <div className="mt-4">
        <span className="label">답변</span>
        <textarea className="input-box" rows={4} value={answer} onChange={(e) => setAnswer(e.target.value)} />
        <label className="flex items-center gap-2 text-xs mt-2">
          <input type="checkbox" checked={sendViaGmail} onChange={(e) => setSendViaGmail(e.target.checked)} />
          Gmail로 발송 (연동 필요)
        </label>
        {err && <div className="text-sm text-accent mt-2">{err}</div>}
        <div className="flex gap-2 mt-3">
          <button className="btn-outline" disabled={sending} onClick={() => save(false)}>{sending ? "..." : "답변 저장"}</button>
          <button className="btn" disabled={sending || !answer} onClick={() => save(true)}>닫기 처리</button>
        </div>
      </div>
    </li>
  );
}

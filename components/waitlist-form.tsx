"use client";

import { useState } from "react";

export function WaitlistForm({ productId }: { productId: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId, email }),
    });
    if (res.ok) setStatus("ok");
    else {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "등록 실패");
      setStatus("error");
    }
  }

  if (status === "ok") {
    return <div className="text-sm">등록되었습니다. 재입고되면 알려드릴게요.</div>;
  }

  return (
    <form onSubmit={submit} className="flex gap-2 items-end">
      <div className="flex-1">
        <label className="label">사고 싶어요 — 재입고 알림</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@domain.com"
          className="input"
        />
      </div>
      <button disabled={status === "loading"} className="btn">
        {status === "loading" ? "..." : "Notify me"}
      </button>
      {error && <div className="text-xs text-accent">{error}</div>}
    </form>
  );
}

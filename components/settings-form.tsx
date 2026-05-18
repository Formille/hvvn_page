"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HtmlEditor } from "./html-editor";
import type { Settings } from "@/lib/types";

export function SettingsForm({ initial }: { initial: Settings | null }) {
  const router = useRouter();
  const [form, setForm] = useState({
    bank_name: initial?.bank_name ?? "",
    bank_account_number: initial?.bank_account_number ?? "",
    bank_account_holder: initial?.bank_account_holder ?? "",
    shipping_fee_default: initial?.shipping_fee_default ?? 4000,
    shipping_fee_remote: initial?.shipping_fee_remote ?? 7000,
    about_html: initial?.about_html ?? "",
    instagram_url: initial?.instagram_url ?? "",
    contact_email: initial?.contact_email ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setMsg(null);
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setMsg(j.error ?? "저장 실패");
      setSaving(false);
      return;
    }
    setMsg("저장되었습니다.");
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <section className="border border-line p-6 space-y-4">
        <div className="eyebrow">— 무통장 입금 계좌</div>
        <Field label="은행"><input className="input-box" value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} placeholder="예: 카카오뱅크" /></Field>
        <Field label="계좌번호"><input className="input-box font-mono" value={form.bank_account_number} onChange={(e) => setForm({ ...form, bank_account_number: e.target.value })} /></Field>
        <Field label="예금주"><input className="input-box" value={form.bank_account_holder} onChange={(e) => setForm({ ...form, bank_account_holder: e.target.value })} /></Field>
      </section>

      <section className="border border-line p-6 space-y-4">
        <div className="eyebrow">— 배송비</div>
        <Field label="기본 배송비 (원)"><input type="number" className="input-box" value={form.shipping_fee_default} onChange={(e) => setForm({ ...form, shipping_fee_default: Number(e.target.value) })} /></Field>
        <Field label="제주/도서산간 (원)"><input type="number" className="input-box" value={form.shipping_fee_remote} onChange={(e) => setForm({ ...form, shipping_fee_remote: Number(e.target.value) })} /></Field>
        <p className="text-xs text-muted">우편번호 63xxx 는 자동으로 도서산간 요금 적용.</p>
      </section>

      <section className="border border-line p-6 space-y-4">
        <div className="eyebrow">— 연락처 / 외부 링크</div>
        <Field label="Instagram URL"><input className="input-box" value={form.instagram_url} onChange={(e) => setForm({ ...form, instagram_url: e.target.value })} placeholder="https://instagram.com/hvvn" /></Field>
        <Field label="Contact email"><input className="input-box" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} placeholder="hello@hvvn.com" /></Field>
      </section>

      <section className="border border-line p-6 md:col-span-2">
        <div className="eyebrow mb-3">— About hvvn (홈페이지 하단)</div>
        <HtmlEditor value={form.about_html} onChange={(html) => setForm({ ...form, about_html: html })} />
      </section>

      <div className="md:col-span-2 flex items-center gap-4">
        <button className="btn" onClick={save} disabled={saving}>{saving ? "..." : "저장"}</button>
        {msg && <span className="text-sm">{msg}</span>}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

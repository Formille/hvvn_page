"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HtmlEditor } from "./html-editor";
import { ImageUploader } from "./image-uploader";
import { formatKRW } from "@/lib/format";
import type { Product } from "@/lib/types";

export function SetForm({ candidates }: { candidates: Product[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    slug: "",
    name: "",
    price_krw: 0,
    short_description: "",
    description_html: "",
    stock: 0,
    is_published: true,
    thumbnail_url: "",
  });
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function save() {
    if (selected.length < 2) {
      setErr("세트 구성 상품을 2개 이상 선택해주세요.");
      return;
    }
    setSaving(true);
    setErr(null);
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, is_set: true, set_member_ids: selected }),
    });
    const j = await res.json();
    if (!res.ok) {
      setErr(j.error ?? "저장 실패");
      setSaving(false);
      return;
    }
    router.replace(`/admin/products/${j.id}/edit`);
  }

  const memberSubtotal = selected
    .map((id) => candidates.find((c) => c.id === id)?.price_krw ?? 0)
    .reduce((a, b) => a + b, 0);

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-6">
        <label className="block">
          <span className="label">세트 이름 *</span>
          <input className="input-box" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })} />
        </label>
        <label className="block">
          <span className="label">슬러그 (URL) *</span>
          <input className="input-box font-mono" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="label">세트 가격 (원) *</span>
            <input type="number" className="input-box" value={form.price_krw} onChange={(e) => setForm({ ...form, price_krw: Number(e.target.value) })} />
            <span className="text-xs text-muted">구성 합계 {formatKRW(memberSubtotal)}</span>
          </label>
          <label className="block">
            <span className="label">세트 재고 *</span>
            <input type="number" className="input-box" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
          </label>
        </div>
        <label className="block">
          <span className="label">짧은 설명</span>
          <textarea className="input-box" rows={2} value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} />
        </label>
        <label className="block">
          <span className="label">상세 설명 (구성 상품 링크는 상세 페이지에 자동 노출됩니다)</span>
          <HtmlEditor value={form.description_html} onChange={(html) => setForm({ ...form, description_html: html })} />
        </label>
      </div>

      <aside className="space-y-6">
        <div className="border border-line p-5">
          <div className="eyebrow mb-3">— 대표 이미지</div>
          <ImageUploader value={form.thumbnail_url} onUploaded={(url) => setForm({ ...form, thumbnail_url: url })} />
        </div>
        <div className="border border-line p-5">
          <div className="eyebrow mb-3">— 세트 구성 상품 ({selected.length})</div>
          <div className="max-h-80 overflow-y-auto divide-y divide-line">
            {candidates.map((c) => (
              <label key={c.id} className="flex items-center gap-2 py-2 text-sm cursor-pointer">
                <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggle(c.id)} />
                <span className="flex-1 truncate">{c.name}</span>
                <span className="text-muted text-xs">{formatKRW(c.price_krw)}</span>
              </label>
            ))}
            {candidates.length === 0 && <div className="py-2 text-sm text-muted">단일 상품을 먼저 등록해주세요.</div>}
          </div>
        </div>
        {err && <div className="text-sm text-accent">{err}</div>}
        <button className="btn w-full" onClick={save} disabled={saving}>{saving ? "..." : "세트 생성"}</button>
      </aside>
    </div>
  );
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9가-힣\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

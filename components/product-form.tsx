"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { HtmlEditor } from "./html-editor";
import { ImageUploader } from "./image-uploader";
import type { Product, ProductImage } from "@/lib/types";

export function ProductForm({
  initial,
  initialImages = [],
}: {
  initial?: Partial<Product>;
  initialImages?: ProductImage[];
}) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [form, setForm] = useState({
    slug: initial?.slug ?? "",
    name: initial?.name ?? "",
    price_krw: initial?.price_krw ?? 0,
    short_description: initial?.short_description ?? "",
    description_html: initial?.description_html ?? "",
    stock: initial?.stock ?? 0,
    is_published: initial?.is_published ?? true,
    thumbnail_url: initial?.thumbnail_url ?? "",
  });
  const [images, setImages] = useState<ProductImage[]>(initialImages);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setErr(null);
    const url = isEdit ? `/api/admin/products/${initial!.id}` : "/api/admin/products";
    const res = await fetch(url, {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, images: images.map((i, idx) => ({ url: i.url, alt: i.alt ?? "", position: idx })) }),
    });
    const json = await res.json();
    if (!res.ok) {
      setErr(json.error ?? "저장 실패");
      setSaving(false);
      return;
    }
    if (!isEdit) router.replace(`/admin/products/${json.id}/edit`);
    router.refresh();
    setSaving(false);
  }

  async function remove() {
    if (!confirm("정말 삭제할까요?")) return;
    const res = await fetch(`/api/admin/products/${initial!.id}`, { method: "DELETE" });
    if (!res.ok) return alert("삭제 실패");
    router.replace("/admin/products");
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-6">
        <Field label="상품명 *"><input className="input-box" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })} required /></Field>
        <Field label="슬러그 (URL) *"><input className="input-box font-mono" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="가격 (원) *"><input type="number" className="input-box" value={form.price_krw} onChange={(e) => setForm({ ...form, price_krw: Number(e.target.value) })} required /></Field>
          <Field label="재고 *"><input type="number" className="input-box" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} required /></Field>
        </div>
        <Field label="짧은 설명"><textarea className="input-box" rows={2} value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} /></Field>
        <Field label="상세 설명">
          <HtmlEditor value={form.description_html} onChange={(html) => setForm({ ...form, description_html: html })} />
        </Field>
      </div>

      <aside className="space-y-6">
        <div className="border border-line p-5">
          <div className="eyebrow mb-3">— 공개 상태</div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
            <span>공개됨 (off일 경우 draft)</span>
          </label>
        </div>

        <div className="border border-line p-5">
          <div className="eyebrow mb-3">— 대표 이미지</div>
          <ImageUploader
            value={form.thumbnail_url}
            onUploaded={(url) => setForm({ ...form, thumbnail_url: url })}
          />
        </div>

        <div className="border border-line p-5">
          <div className="eyebrow mb-3">— 추가 이미지</div>
          <ImageGallery images={images} onChange={setImages} />
        </div>

        {err && <div className="text-sm text-accent">{err}</div>}
        <button className="btn w-full" onClick={save} disabled={saving}>{saving ? "..." : isEdit ? "저장" : "생성"}</button>
        {isEdit && (
          <button className="btn-ghost px-0 underline text-accent" onClick={remove}>삭제</button>
        )}
      </aside>
    </div>
  );
}

function ImageGallery({ images, onChange }: { images: ProductImage[]; onChange: (next: ProductImage[]) => void }) {
  return (
    <div className="space-y-3">
      <ImageUploader
        value=""
        onUploaded={(url) => onChange([...images, { id: crypto.randomUUID(), product_id: "", url, alt: "", position: images.length }])}
      />
      <div className="grid grid-cols-3 gap-2">
        {images.map((img, i) => (
          <div key={img.id} className="relative aspect-square bg-sand group">
            <Image src={img.url} alt={img.alt ?? ""} fill className="object-cover" sizes="100px" />
            <button onClick={() => onChange(images.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-ink text-paper text-[10px] px-1 opacity-0 group-hover:opacity-100">×</button>
          </div>
        ))}
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

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

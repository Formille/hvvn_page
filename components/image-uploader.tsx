"use client";

import { useState } from "react";
import Image from "next/image";

export function ImageUploader({ value, onUploaded }: { value: string; onUploaded: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handle(file: File) {
    setUploading(true);
    setErr(null);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const json = await res.json();
    if (!res.ok) {
      setErr(json.error ?? "업로드 실패");
      setUploading(false);
      return;
    }
    onUploaded(json.url);
    setUploading(false);
  }

  return (
    <div>
      {value && (
        <div className="relative aspect-square bg-sand mb-3">
          <Image src={value} alt="" fill className="object-cover" sizes="200px" />
        </div>
      )}
      <label className="btn-outline cursor-pointer text-center block">
        {uploading ? "Uploading..." : value ? "다시 업로드" : "이미지 업로드"}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handle(f);
          }}
        />
      </label>
      {err && <div className="text-xs text-accent mt-2">{err}</div>}
    </div>
  );
}

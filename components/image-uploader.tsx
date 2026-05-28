"use client";

import { useRef, useState } from "react";
import Image from "next/image";

const MAX_BYTES = 4 * 1024 * 1024; // Vercel serverless body limit ~4.5MB

export function ImageUploader({ value, onUploaded }: { value: string; onUploaded: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handle(file: File) {
    setErr(null);

    if (file.size > MAX_BYTES) {
      setErr(`이미지가 너무 큽니다 (${(file.size / 1024 / 1024).toFixed(1)}MB). ${MAX_BYTES / 1024 / 1024}MB 이하로 줄여주세요.`);
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const text = await res.text();
      let json: { url?: string; error?: string } = {};
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        // non-JSON response (e.g. Vercel 413 HTML)
      }
      if (!res.ok || !json.url) {
        setErr(json.error ?? `업로드 실패 (${res.status})`);
        return;
      }
      onUploaded(json.url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "업로드 중 오류");
    } finally {
      setUploading(false);
      // Allow picking the same file again to retry / re-upload.
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      {value && (
        <div className="relative aspect-square mb-3">
          <Image src={value} alt="" fill className="object-contain" sizes="200px" />
        </div>
      )}
      <label className="btn-outline cursor-pointer text-center block">
        {uploading ? "Uploading..." : value ? "다시 업로드" : "이미지 업로드"}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handle(f);
          }}
        />
      </label>
      {err && <div className="text-xs text-accent mt-2 break-words">{err}</div>}
    </div>
  );
}

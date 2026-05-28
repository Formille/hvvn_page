"use client";

import { useRef, useState } from "react";
import Image from "next/image";

const MAX_BYTES = 4 * 1024 * 1024; // Vercel serverless body limit ~4.5MB — leave headroom
const INITIAL_MAX_DIM = 2048;
const MIN_DIM = 480;
const MAX_ATTEMPTS = 7;

/**
 * Client-side resize preserving aspect ratio. Iteratively shrinks the
 * longest side (and JPEG quality) until the encoded blob fits MAX_BYTES.
 * PNGs keep alpha; JPEGs trade quality first, then dimension.
 * Falls through (returns original) for non-rasters like SVG / GIF.
 */
async function compressImage(file: File): Promise<File> {
  if (file.size <= MAX_BYTES) return file;
  if (file.type === "image/svg+xml" || file.type === "image/gif") return file;

  const isPng = file.type === "image/png";
  const mime = isPng ? "image/png" : "image/jpeg";
  const ext = isPng ? "png" : "jpg";

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }
  const { width: srcW, height: srcH } = bitmap;
  const longest = Math.max(srcW, srcH);

  let targetLongest = Math.min(longest, INITIAL_MAX_DIM);

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const scale = targetLongest / longest;
    const w = Math.max(1, Math.round(srcW * scale));
    const h = Math.max(1, Math.round(srcH * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) break;
    ctx.drawImage(bitmap, 0, 0, w, h);

    const quality = isPng ? undefined : Math.max(0.55, 0.92 - attempt * 0.07);
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, mime, quality));
    if (!blob) break;

    if (blob.size <= MAX_BYTES) {
      const name = file.name.replace(/\.[^.]+$/, "") + "." + ext;
      bitmap.close?.();
      return new File([blob], name, { type: mime });
    }

    // Still too big — shrink further. Don't go below MIN_DIM.
    const next = Math.round(targetLongest * 0.82);
    if (next < MIN_DIM) break;
    targetLongest = next;
  }

  bitmap.close?.();
  return file;
}

export function ImageUploader({ value, onUploaded }: { value: string; onUploaded: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [stage, setStage] = useState<"idle" | "compressing" | "uploading">("idle");
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handle(file: File) {
    setErr(null);
    setUploading(true);
    try {
      let prepared = file;
      if (file.size > MAX_BYTES) {
        setStage("compressing");
        prepared = await compressImage(file);
        if (prepared.size > MAX_BYTES) {
          setErr(`이미지를 ${(MAX_BYTES / 1024 / 1024).toFixed(0)}MB 이하로 줄이지 못했습니다 (현재 ${(prepared.size / 1024 / 1024).toFixed(1)}MB). 원본을 더 작게 저장해 다시 시도해주세요.`);
          return;
        }
      }

      setStage("uploading");
      const fd = new FormData();
      fd.append("file", prepared);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const text = await res.text();
      let json: { url?: string; error?: string } = {};
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        // non-JSON (e.g., 413 HTML)
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
      setStage("idle");
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const label = uploading
    ? stage === "compressing"
      ? "Compressing..."
      : "Uploading..."
    : value
    ? "다시 업로드"
    : "이미지 업로드";

  return (
    <div>
      {value && (
        <div className="relative aspect-square mb-3">
          <Image src={value} alt="" fill className="object-contain" sizes="200px" />
        </div>
      )}
      <label className="btn-outline cursor-pointer text-center block">
        {label}
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

/**
 * Upload local images to Supabase Storage and print their public URLs.
 *
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   node scripts/upload-to-supabase.mjs
 *
 * Uploads:
 *   public/images/products/*  -> bucket "product-images" (folder seed/)
 *   public/images/*.png (logos/banners) -> bucket "site-assets"
 *
 * Both buckets are created by db/schema.sql. Re-runnable (upsert).
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });
const TYPES = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml" };
const isImage = (f) => /\.(png|jpe?g|webp|svg)$/i.test(f);

async function uploadOne(bucket, path, fsPath) {
  const buf = readFileSync(fsPath);
  const ext = fsPath.slice(fsPath.lastIndexOf(".")).toLowerCase();
  const { error } = await sb.storage.from(bucket).upload(path, buf, {
    contentType: TYPES[ext] ?? "application/octet-stream",
    upsert: true,
  });
  if (error) {
    console.error(`✗ ${bucket}/${path}: ${error.message}`);
    return null;
  }
  const { data } = sb.storage.from(bucket).getPublicUrl(path);
  console.log(`✓ ${bucket}/${path}\n   ${data.publicUrl}`);
  return data.publicUrl;
}

const results = { products: {}, assets: {} };

// Product photos -> product-images/seed/
const productsDir = "public/images/products";
for (const f of readdirSync(productsDir).filter(isImage)) {
  const u = await uploadOne("product-images", `seed/${f}`, join(productsDir, f));
  if (u) results.products[f] = u;
}

// Logos / banners (top-level files in public/images) -> site-assets/
const imagesDir = "public/images";
for (const f of readdirSync(imagesDir).filter((f) => isImage(f) && statSync(join(imagesDir, f)).isFile())) {
  const u = await uploadOne("site-assets", f, join(imagesDir, f));
  if (u) results.assets[f] = u;
}

console.log("\n--- public URLs (use these for products.thumbnail_url / logo src) ---");
console.log(JSON.stringify(results, null, 2));

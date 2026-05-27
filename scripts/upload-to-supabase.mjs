/**
 * Upload local product/logo images to Supabase Storage and print their
 * public URLs. Run locally with your service-role key:
 *
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   node scripts/upload-to-supabase.mjs
 *
 * Requires the `product-images` bucket (created by db/schema.sql).
 * Re-runnable: existing objects are overwritten (upsert).
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });
const BUCKET = "product-images";
const dir = "public/images/products";

const contentTypes = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" };

const files = readdirSync(dir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
const results = {};

for (const file of files) {
  const buf = readFileSync(join(dir, file));
  const ext = file.slice(file.lastIndexOf(".")).toLowerCase();
  const path = `seed/${file}`;
  const { error } = await sb.storage.from(BUCKET).upload(path, buf, {
    contentType: contentTypes[ext] ?? "application/octet-stream",
    upsert: true,
  });
  if (error) {
    console.error(`✗ ${file}: ${error.message}`);
    continue;
  }
  const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
  results[file] = data.publicUrl;
  console.log(`✓ ${file} -> ${data.publicUrl}`);
}

console.log("\n--- Update products.thumbnail_url with these URLs (e.g. in /admin/products) ---");
console.log(JSON.stringify(results, null, 2));

import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CartBadge } from "./cart-badge";

export async function SiteHeader() {
  const supabase = await createSupabaseServerClient();
  const { data: settings } = await supabase
    .from("settings")
    .select("instagram_url")
    .eq("id", 1)
    .maybeSingle();

  const ig = settings?.instagram_url ?? "https://instagram.com/";

  return (
    <header className="border-b border-line bg-paper/80 backdrop-blur sticky top-0 z-40">
      <div className="container-page h-16 grid grid-cols-3 items-center">
        <nav className="flex items-center gap-4 text-[12px] tracking-widest2 uppercase">
          <Link href="/" className="btn-ghost px-0">Shop</Link>
          <Link href="/#about" className="btn-ghost px-0">About</Link>
          <Link href="/orders" className="btn-ghost px-0">Orders</Link>
        </nav>
        <div className="flex justify-center">
          <Link href="/" className="font-serif text-2xl tracking-tight">
            <span aria-label="hvvn">hvvn.</span>
          </Link>
        </div>
        <div className="flex items-center justify-end gap-3">
          <a
            href={ig}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="btn-ghost px-0"
          >
            Instagram
          </a>
          <Link href="/cart" className="btn-ghost px-0">
            Cart <CartBadge />
          </Link>
        </div>
      </div>
    </header>
  );
}

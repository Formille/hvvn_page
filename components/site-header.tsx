import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CartBadge } from "./cart-badge";
import { BrandLogo } from "./brand-logo";

export async function SiteHeader() {
  const supabase = await createSupabaseServerClient();
  const { data: settings } = await supabase
    .from("settings")
    .select("instagram_url")
    .eq("id", 1)
    .maybeSingle();

  const ig = settings?.instagram_url ?? "https://instagram.com/";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-velvetDeep/40 backdrop-blur-md">
      <div className="container-page h-16 grid grid-cols-3 items-center">
        <nav className="flex items-center gap-4 text-[12px] tracking-widest2 uppercase">
          <Link href="/" className="btn-ghost px-0">Shop</Link>
          <Link href="/#about" className="btn-ghost px-0 hidden sm:inline-flex">About</Link>
          <Link href="/orders" className="btn-ghost px-0">Orders</Link>
        </nav>
        <div className="flex justify-center">
          <Link href="/" aria-label="hvving home" className="flex items-center">
            <BrandLogo
              src="/images/hvving-chrome.png"
              alt="hvving"
              className="h-7 md:h-8 w-auto object-contain drop-shadow-chrome"
              fallbackClassName="text-2xl"
            />
          </Link>
        </div>
        <div className="flex items-center justify-end gap-3 text-[12px] tracking-widest2 uppercase">
          <a href={ig} target="_blank" rel="noreferrer" aria-label="Instagram" className="btn-ghost px-0">
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

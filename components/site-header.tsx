import Link from "next/link";
import { CartBadge } from "./cart-badge";
import { BrandLogo } from "./brand-logo";
import { siteAsset } from "@/lib/assets";

export function SiteHeader() {
  const headerLogo = siteAsset("header_1.png") ?? "/images/header_1.png";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-black/70 backdrop-blur-md">
      <div className="container-page h-14 grid grid-cols-3 items-center text-[12px] tracking-widest2 uppercase">
        <nav className="flex items-center gap-4">
          <Link href="/" className="btn-ghost px-0">Shop</Link>
        </nav>
        <div className="flex justify-center">
          <Link href="/" aria-label="hvving home" className="flex items-center">
            <BrandLogo
              src={headerLogo}
              alt="hvving"
              className="h-7 md:h-8 w-auto object-contain"
              fallbackClassName="text-lg"
            />
          </Link>
        </div>
        <div className="flex items-center justify-end gap-4">
          <Link href="/orders" className="btn-ghost px-0">Orders</Link>
          <Link href="/cart" className="btn-ghost px-0">Cart <CartBadge /></Link>
        </div>
      </div>
    </header>
  );
}

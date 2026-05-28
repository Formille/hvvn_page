import Link from "next/link";
import { BrandLogo } from "./brand-logo";
import { HeaderMenu } from "./header-menu";
import { siteAsset } from "@/lib/assets";

export function SiteHeader() {
  const headerLogo = siteAsset("header_1.png") ?? "/images/header_1.png";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-black/70 backdrop-blur-md">
      <div className="container-page h-16 md:h-12 grid grid-cols-3 items-center">
        <div />
        <div className="flex justify-center overflow-visible">
          <Link href="/" aria-label="hvving home" className="flex items-center">
            <BrandLogo
              src={headerLogo}
              alt="hvving"
              className="h-[37px] md:h-8 w-auto object-contain scale-x-[1.96] scale-y-[1.21] origin-center"
              fallbackClassName="text-lg"
            />
          </Link>
        </div>
        <div className="flex items-center justify-end">
          <HeaderMenu />
        </div>
      </div>
    </header>
  );
}

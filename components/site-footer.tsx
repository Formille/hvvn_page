import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { BrandLogo } from "./brand-logo";

export async function SiteFooter() {
  const supabase = await createSupabaseServerClient();
  const { data: settings } = await supabase
    .from("settings")
    .select("instagram_url, contact_email")
    .eq("id", 1)
    .maybeSingle();

  return (
    <footer className="mt-32 border-t border-line">
      <div className="container-page py-14 grid md:grid-cols-3 gap-8 text-sm text-muted">
        <div>
          <BrandLogo
            src="/images/hvving-bw.png"
            alt="hvving"
            className="h-6 w-auto object-contain mb-3 opacity-80"
            fallbackClassName="text-xl mb-3 inline-block"
          />
          <p>아티스트 hvving 의 공식 굿즈 스토어.</p>
        </div>
        <div>
          <div className="eyebrow mb-2">Contact</div>
          {settings?.contact_email && <div>{settings.contact_email}</div>}
          {settings?.instagram_url && (
            <a className="underline hover:text-chrome" href={settings.instagram_url} target="_blank" rel="noreferrer">
              Instagram
            </a>
          )}
        </div>
        <div>
          <div className="eyebrow mb-2">Customer</div>
          <ul className="space-y-1">
            <li><Link href="/orders" className="hover:text-chrome">주문조회</Link></li>
            <li><Link href="/#about" className="hover:text-chrome">About hvving</Link></li>
          </ul>
        </div>
      </div>
      <div className="container-page py-6 border-t border-line text-xs text-muted flex justify-between">
        <div>© {new Date().getFullYear()} hvving.</div>
        <Link href="/admin" className="hover:text-chrome">Admin</Link>
      </div>
    </footer>
  );
}

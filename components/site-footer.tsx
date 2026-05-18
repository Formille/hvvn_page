import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function SiteFooter() {
  const supabase = await createSupabaseServerClient();
  const { data: settings } = await supabase
    .from("settings")
    .select("instagram_url, contact_email")
    .eq("id", 1)
    .maybeSingle();

  return (
    <footer className="mt-32 border-t border-line">
      <div className="container-page py-12 grid md:grid-cols-3 gap-8 text-sm text-muted">
        <div>
          <div className="font-serif text-xl text-ink mb-2">hvvn.</div>
          <p>아티스트 hvvn의 공식 굿즈 스토어.</p>
        </div>
        <div>
          <div className="eyebrow mb-2">Contact</div>
          {settings?.contact_email && <div>{settings.contact_email}</div>}
          {settings?.instagram_url && (
            <a className="underline" href={settings.instagram_url} target="_blank" rel="noreferrer">
              Instagram
            </a>
          )}
        </div>
        <div>
          <div className="eyebrow mb-2">Customer</div>
          <ul className="space-y-1">
            <li><Link href="/orders" className="hover:text-ink">주문조회</Link></li>
            <li><Link href="/#about" className="hover:text-ink">About hvvn</Link></li>
          </ul>
        </div>
      </div>
      <div className="container-page py-6 border-t border-line text-xs text-muted flex justify-between">
        <div>© {new Date().getFullYear()} hvvn.</div>
        <Link href="/admin" className="hover:text-ink">Admin</Link>
      </div>
    </footer>
  );
}

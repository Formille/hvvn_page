import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminSignOut } from "@/components/admin-signout";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();

  return (
    <div className="container-page py-8 md:py-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-6">
        <div>
          <div className="eyebrow">— Admin</div>
          <h1 className="font-gothic chrome-text text-3xl md:text-4xl">hvving admin</h1>
        </div>
        {user && (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted truncate max-w-[60vw] sm:max-w-none">{user.email}</span>
            <AdminSignOut />
          </div>
        )}
      </div>
      {user && (
        <nav className="flex gap-5 md:gap-6 text-[12px] tracking-widest2 uppercase border-b border-line pb-3 mb-8 overflow-x-auto whitespace-nowrap -mx-5 px-5 md:mx-0 md:px-0 [scrollbar-width:none]">
          <Link href="/admin" className="hover:text-chrome">Dashboard</Link>
          <Link href="/admin/orders" className="hover:text-chrome">Orders</Link>
          <Link href="/admin/products" className="hover:text-chrome">Products</Link>
          <Link href="/admin/sets/new" className="hover:text-chrome">Sets</Link>
          <Link href="/admin/waitlist" className="hover:text-chrome">Waitlist</Link>
          <Link href="/admin/inquiries" className="hover:text-chrome">Inquiries</Link>
          <Link href="/admin/integrations" className="hover:text-chrome">Integrations</Link>
          <Link href="/admin/settings" className="hover:text-chrome">Settings</Link>
        </nav>
      )}
      {children}
    </div>
  );
}

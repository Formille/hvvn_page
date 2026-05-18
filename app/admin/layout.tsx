import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminSignOut } from "@/components/admin-signout";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();

  return (
    <div className="container-page py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="eyebrow">— Admin</div>
          <h1 className="font-serif text-3xl">hvvn 관리자</h1>
        </div>
        {user && (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted">{user.email}</span>
            <AdminSignOut />
          </div>
        )}
      </div>
      {user && (
        <nav className="flex gap-6 text-[12px] tracking-widest2 uppercase border-b border-line pb-3 mb-8">
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/orders">Orders</Link>
          <Link href="/admin/products">Products</Link>
          <Link href="/admin/sets">Sets</Link>
          <Link href="/admin/waitlist">Waitlist</Link>
          <Link href="/admin/inquiries">Inquiries</Link>
          <Link href="/admin/integrations">Integrations</Link>
          <Link href="/admin/settings">Settings</Link>
        </nav>
      )}
      {children}
    </div>
  );
}

import Link from "next/link";

export function SiteFooter() {
  return (
    <footer>
      <div className="container-page py-6 text-xs text-muted flex justify-between">
        <div>© {new Date().getFullYear()} hvving.</div>
        <Link href="/admin" className="hover:text-chrome">Admin</Link>
      </div>
    </footer>
  );
}

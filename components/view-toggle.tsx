import Link from "next/link";
import clsx from "clsx";

export function ViewToggle({ current }: { current: "grid" | "list" }) {
  return (
    <div className="flex items-center gap-1 text-[11px] tracking-widest2 uppercase">
      <Link href="/?view=grid" className={clsx("px-2 py-1 border", current === "grid" ? "border-chrome text-chrome" : "border-line text-muted")}>
        Grid
      </Link>
      <Link href="/?view=list" className={clsx("px-2 py-1 border", current === "list" ? "border-chrome text-chrome" : "border-line text-muted")}>
        List
      </Link>
    </div>
  );
}

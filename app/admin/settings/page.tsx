import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/settings-form";
import type { Settings } from "@/lib/types";

export default async function AdminSettingsPage() {
  const sb = await createSupabaseServerClient();
  const { data } = await sb.from("settings").select("*").eq("id", 1).maybeSingle<Settings>();
  return (
    <div>
      <h2 className="font-serif text-2xl mb-6">설정</h2>
      <SettingsForm initial={data ?? null} />
    </div>
  );
}

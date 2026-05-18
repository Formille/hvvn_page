import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { SetForm } from "@/components/set-form";
import type { Product } from "@/lib/types";

export default async function NewSetPage() {
  const sb = createSupabaseServiceClient();
  const { data } = await sb.from("products").select("*").eq("is_set", false).order("created_at", { ascending: false });
  const candidates = (data ?? []) as Product[];

  return (
    <div>
      <h2 className="font-serif text-2xl mb-6">새 세트 상품</h2>
      <p className="text-sm text-muted mb-6">단일 상품 여러개를 묶어서 세트를 만듭니다. 세트는 별도의 가격/설명을 가질 수 있고, 상세 페이지 상단에 구성 상품 링크가 자동으로 표시됩니다.</p>
      <SetForm candidates={candidates} />
    </div>
  );
}

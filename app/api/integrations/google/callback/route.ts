import { NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { exchangeCodeForTokens, fetchGoogleProfile } from "@/lib/integrations/google";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  if (error) return NextResponse.redirect(new URL(`/admin/integrations?error=${error}`, req.url));
  if (!code) return NextResponse.redirect(new URL("/admin/integrations?error=missing_code", req.url));

  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/admin/login", req.url));

  try {
    const tokens = await exchangeCodeForTokens(code);
    const profile = await fetchGoogleProfile(tokens.access_token);
    const svc = createSupabaseServiceClient();
    await svc.from("integrations").upsert(
      {
        provider: "google",
        account_email: profile.email,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token ?? null,
        scopes: tokens.scope?.split(" ") ?? null,
        expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        metadata: { name: profile.name, picture: profile.picture },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "provider" }
    );
    return NextResponse.redirect(new URL("/admin/integrations?connected=google", req.url));
  } catch (e: any) {
    return NextResponse.redirect(new URL(`/admin/integrations?error=${encodeURIComponent(e.message)}`, req.url));
  }
}

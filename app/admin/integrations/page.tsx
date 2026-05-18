import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { listIntegrations } from "@/lib/integrations";
import { DisconnectButton } from "@/components/disconnect-button";

export default async function IntegrationsPage() {
  const providers = listIntegrations();
  const sb = createSupabaseServiceClient();
  const { data: connected } = await sb.from("integrations").select("provider, account_email, scopes, expires_at, updated_at");
  const byProvider = new Map((connected ?? []).map((c) => [c.provider, c]));

  return (
    <div>
      <h2 className="font-serif text-2xl mb-2">외부 서비스 연동</h2>
      <p className="text-sm text-muted mb-8">
        Google 계정을 연동하면 Gmail로 답변·재입고 알림을 보낼 수 있습니다. 추후 카카오·Naver 등 다른 서비스도 같은 방식으로 추가 가능합니다.
      </p>

      <ul className="space-y-4">
        {providers.map((p) => {
          const linked = byProvider.get(p.id);
          const authUrl = p.authStartUrl();
          return (
            <li key={p.id} className="border border-line p-6 grid grid-cols-[1fr_auto] gap-4 items-center">
              <div>
                <div className="font-serif text-xl">{p.label}</div>
                <div className="text-sm text-muted mt-1">{p.description}</div>
                <div className="text-xs text-muted mt-2">
                  Capabilities: {p.capabilities.join(", ")}
                </div>
                {linked && (
                  <div className="text-xs mt-2">
                    연동됨 — <span className="font-medium">{linked.account_email}</span>
                  </div>
                )}
                {!p.isConfigured() && (
                  <div className="text-xs text-accent mt-2">
                    환경변수 (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI) 가 설정되어 있지 않습니다.
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 items-end">
                {linked ? (
                  <>
                    {authUrl && <a href={authUrl} className="btn-outline">재연결</a>}
                    <DisconnectButton provider={p.id} />
                  </>
                ) : (
                  authUrl ? <a href={authUrl} className="btn">Connect</a> : <span className="text-xs text-muted">설정 필요</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <details className="mt-12 text-sm">
        <summary className="cursor-pointer text-muted">Google OAuth 설정 가이드</summary>
        <ol className="mt-3 space-y-2 text-sm text-muted list-decimal pl-5">
          <li>Google Cloud Console → APIs &amp; Services → Credentials 에서 OAuth 2.0 Client ID 생성 (Type: Web application)</li>
          <li>Authorized redirect URI: <code className="bg-sand px-1">{`<your-domain>/api/integrations/google/callback`}</code></li>
          <li>Gmail API와 Drive API 활성화</li>
          <li>Vercel 환경 변수: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI 추가</li>
        </ol>
      </details>
    </div>
  );
}

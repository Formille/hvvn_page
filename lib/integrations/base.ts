/**
 * Connect point abstraction. Each external service (Google, Kakao, Naver, …)
 * implements this interface so the admin UI can list, connect, and use them
 * through a single surface.
 */

export type IntegrationCapability = "send_email" | "store_file" | "send_message" | "notify";

export type IntegrationRow = {
  id: string;
  provider: string;
  account_email: string | null;
  access_token: string | null;
  refresh_token: string | null;
  scopes: string[] | null;
  expires_at: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export interface IntegrationProvider {
  id: string;
  label: string;
  description: string;
  capabilities: IntegrationCapability[];
  authStartUrl(state?: string): string | null;
  isConfigured(): boolean;
}

const registry = new Map<string, IntegrationProvider>();

export function registerIntegration(p: IntegrationProvider) {
  registry.set(p.id, p);
}

export function listIntegrations(): IntegrationProvider[] {
  return Array.from(registry.values());
}

export function getIntegration(id: string): IntegrationProvider | undefined {
  return registry.get(id);
}

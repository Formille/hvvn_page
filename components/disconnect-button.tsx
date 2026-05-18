"use client";

import { useRouter } from "next/navigation";

export function DisconnectButton({ provider }: { provider: string }) {
  const router = useRouter();
  return (
    <button
      className="btn-ghost px-0 underline text-accent"
      onClick={async () => {
        if (!confirm("연동을 해제할까요?")) return;
        await fetch(`/api/admin/integrations/${provider}`, { method: "DELETE" });
        router.refresh();
      }}
    >
      연결 해제
    </button>
  );
}

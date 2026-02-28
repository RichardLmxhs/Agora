import { Suspense } from "react";
import { api, HydrateClient } from "~/trpc/server";
import { MainLayout } from "~/components/layout/MainLayout";
import { MyAgentsList } from "~/components/console/MyAgentsList";

function AgentsLoading() {
  return (
    <div className="space-y-4 px-4 py-6">
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className="h-24 animate-pulse rounded-lg border border-border bg-muted/30"
        />
      ))}
    </div>
  );
}

export default async function ConsolePage() {
  void api.console.getMyAgents.prefetch();

  return (
    <HydrateClient>
      <MainLayout>
        <Suspense fallback={<AgentsLoading />}>
          <MyAgentsList />
        </Suspense>
      </MainLayout>
    </HydrateClient>
  );
}

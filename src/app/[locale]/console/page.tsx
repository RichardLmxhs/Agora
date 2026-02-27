import { Suspense } from "react";
import { api, HydrateClient } from "~/trpc/server";
import { Header } from "~/components/layout/Header";
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
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="mx-auto w-full max-w-2xl border-x border-border">
          <Suspense fallback={<AgentsLoading />}>
            <MyAgentsList />
          </Suspense>
        </main>
      </div>
    </HydrateClient>
  );
}

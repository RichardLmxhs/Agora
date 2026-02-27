import { notFound } from "next/navigation";
import { api, HydrateClient } from "~/trpc/server";
import { Header } from "~/components/layout/Header";
import { AgentManageTabs } from "~/components/console/AgentManageTabs";

export default async function AgentManagePage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = await params;

  const agent = await api.console.getMyAgent({ agentId }).catch(() => null);
  if (!agent) {
    notFound();
  }

  return (
    <HydrateClient>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="mx-auto w-full max-w-2xl border-x border-border">
          <AgentManageTabs agent={agent} />
        </main>
      </div>
    </HydrateClient>
  );
}

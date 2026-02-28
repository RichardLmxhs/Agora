import { notFound } from "next/navigation";
import { api, HydrateClient } from "~/trpc/server";
import { MainLayout } from "~/components/layout/MainLayout";
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
      <MainLayout>
        <AgentManageTabs agent={agent} />
      </MainLayout>
    </HydrateClient>
  );
}

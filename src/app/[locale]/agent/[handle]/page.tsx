import { notFound } from "next/navigation";
import { api, HydrateClient } from "~/trpc/server";
import { MainLayout } from "~/components/layout/MainLayout";
import { AgentProfileHeader } from "~/components/agent/AgentProfileHeader";
import { AgentProfileTabs } from "~/components/agent/AgentProfileTabs";

export default async function AgentProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  const agent = await api.agent.getByHandle({ handle });

  if (!agent) {
    notFound();
  }

  void api.post.getByAgentHandle.prefetch({ handle, limit: 20 });

  return (
    <HydrateClient>
      <MainLayout>
        <AgentProfileHeader agent={agent} />
        <AgentProfileTabs handle={handle} skills={agent.skills} />
      </MainLayout>
    </HydrateClient>
  );
}

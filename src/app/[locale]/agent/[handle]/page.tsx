import { Suspense } from "react";
import { notFound } from "next/navigation";
import { api, HydrateClient } from "~/trpc/server";
import { Header } from "~/components/layout/Header";
import { AgentProfileHeader } from "~/components/agent/AgentProfileHeader";
import { AgentSkills } from "~/components/agent/AgentSkills";
import { AgentPosts } from "~/components/agent/AgentPosts";

function PostsLoading() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="border-b border-border px-4 py-3">
          <div className="flex gap-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

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
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="mx-auto w-full max-w-2xl border-x border-border">
          <AgentProfileHeader agent={agent} />
          <AgentSkills skills={agent.skills} />
          <Suspense fallback={<PostsLoading />}>
            <AgentPosts handle={handle} />
          </Suspense>
        </main>
      </div>
    </HydrateClient>
  );
}

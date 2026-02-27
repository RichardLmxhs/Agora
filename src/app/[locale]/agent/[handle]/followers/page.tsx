import { notFound } from "next/navigation";
import { api, HydrateClient } from "~/trpc/server";
import { Header } from "~/components/layout/Header";
import { FollowList } from "~/components/agent/FollowList";

export default async function FollowersPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  const agent = await api.agent.getByHandle({ handle });
  if (!agent) {
    notFound();
  }

  void api.agent.getFollowers.prefetch({ handle });

  return (
    <HydrateClient>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="mx-auto w-full max-w-2xl border-x border-border">
          <FollowList handle={handle} type="followers" />
        </main>
      </div>
    </HydrateClient>
  );
}

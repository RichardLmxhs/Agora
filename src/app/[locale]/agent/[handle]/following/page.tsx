import { notFound } from "next/navigation";
import { api, HydrateClient } from "~/trpc/server";
import { MainLayout } from "~/components/layout/MainLayout";
import { FollowList } from "~/components/agent/FollowList";

export default async function FollowingPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  const agent = await api.agent.getByHandle({ handle });
  if (!agent) {
    notFound();
  }

  void api.agent.getFollowing.prefetch({ handle });

  return (
    <HydrateClient>
      <MainLayout>
        <FollowList handle={handle} type="following" />
      </MainLayout>
    </HydrateClient>
  );
}

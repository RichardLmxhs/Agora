"use client";

import { useTranslations } from "next-intl";
import { api } from "~/trpc/react";
import { PostCard } from "~/components/feed/PostCard";

interface AgentPostsProps {
  handle: string;
}

export function AgentPosts({ handle }: AgentPostsProps) {
  const t = useTranslations("feed");
  const [posts] = api.post.getByAgentHandle.useSuspenseQuery({
    handle,
    limit: 20,
  });

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground">{t("empty")}</p>
      </div>
    );
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

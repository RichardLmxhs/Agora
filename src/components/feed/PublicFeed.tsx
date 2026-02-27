"use client";

import { useTranslations } from "next-intl";
import { api } from "~/trpc/react";
import { PostCard } from "./PostCard";

export function PublicFeed() {
  const t = useTranslations("feed");
  const [posts] = api.post.getPublicFeed.useSuspenseQuery({ limit: 20 });

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg text-muted-foreground">{t("empty")}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

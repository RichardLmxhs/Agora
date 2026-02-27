"use client";

import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { api } from "~/trpc/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface FollowListProps {
  handle: string;
  type: "followers" | "following";
}

export function FollowList({ handle, type }: FollowListProps) {
  const t = useTranslations("agent");
  const router = useRouter();

  const [agents] =
    type === "followers"
      ? api.agent.getFollowers.useSuspenseQuery({ handle })
      : api.agent.getFollowing.useSuspenseQuery({ handle });

  const title =
    type === "followers" ? t("followersList") : t("followingList");
  const emptyMessage =
    type === "followers" ? t("noFollowers") : t("noFollowing");

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border px-4 py-3">
        <button
          onClick={() => router.back()}
          className="rounded-full p-1 transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="font-bold">{title}</h2>
          <p className="text-sm text-muted-foreground">@{handle}</p>
        </div>
      </div>

      {/* List */}
      {agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <div>
          {agents.map((agent) => {
            const initials = agent.displayName.slice(0, 2).toUpperCase();

            return (
              <Link
                key={agent.id}
                href={`/agent/${agent.handle}`}
                className="flex items-center gap-3 border-b border-border px-4 py-3 transition-colors hover:bg-muted/30"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {agent.displayName}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    @{agent.handle}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

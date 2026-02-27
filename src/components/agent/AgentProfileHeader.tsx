"use client";

import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import Link from "next/link";

interface AgentProfileHeaderProps {
  agent: {
    id: string;
    handle: string;
    displayName: string;
    avatarUrl: string | null;
    createdAt: Date;
    _count: {
      posts: number;
      followers: number;
      following: number;
    };
  };
}

export function AgentProfileHeader({ agent }: AgentProfileHeaderProps) {
  const t = useTranslations("agent");
  const initials = agent.displayName.slice(0, 2).toUpperCase();

  return (
    <div className="border-b border-border px-4 pb-4 pt-6">
      {/* Avatar + Name */}
      <div className="flex items-start gap-4">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 pt-1">
          <h1 className="truncate text-xl font-bold">{agent.displayName}</h1>
          <p className="text-muted-foreground">@{agent.handle}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 flex gap-5 text-sm">
        <div>
          <span className="font-semibold">{agent._count.posts}</span>{" "}
          <span className="text-muted-foreground">{t("posts")}</span>
        </div>
        <Link
          href={`/agent/${agent.handle}/following`}
          className="transition-colors hover:underline"
        >
          <span className="font-semibold">{agent._count.following}</span>{" "}
          <span className="text-muted-foreground">{t("following")}</span>
        </Link>
        <Link
          href={`/agent/${agent.handle}/followers`}
          className="transition-colors hover:underline"
        >
          <span className="font-semibold">{agent._count.followers}</span>{" "}
          <span className="text-muted-foreground">{t("followers")}</span>
        </Link>
      </div>
    </div>
  );
}

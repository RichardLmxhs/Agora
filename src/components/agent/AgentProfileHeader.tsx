"use client";

import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { getAvatarUrl } from "~/lib/avatar";
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
    <div
      className="border-b border-border"
      style={{
        background: "linear-gradient(135deg, oklch(0.50 0.24 275), oklch(0.55 0.22 300), oklch(0.60 0.20 330))",
      }}
    >
      <div className="px-4 py-6">
        {/* Avatar + Name */}
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border-4 border-white/20 shadow-lg">
            <AvatarImage src={agent.avatarUrl ?? getAvatarUrl(agent.handle)} alt={agent.displayName} />
            <AvatarFallback className="bg-white/20 text-2xl font-bold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold text-white">{agent.displayName}</h1>
            <p className="text-white/70">@{agent.handle}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 flex gap-5 text-sm">
          <div>
            <span className="font-semibold text-white">{agent._count.posts}</span>{" "}
            <span className="text-white/70">{t("posts")}</span>
          </div>
          <Link
            href={`/agent/${agent.handle}/following`}
            className="transition-colors hover:underline"
          >
            <span className="font-semibold text-white">{agent._count.following}</span>{" "}
            <span className="text-white/70">{t("following")}</span>
          </Link>
          <Link
            href={`/agent/${agent.handle}/followers`}
            className="transition-colors hover:underline"
          >
            <span className="font-semibold text-white">{agent._count.followers}</span>{" "}
            <span className="text-white/70">{t("followers")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

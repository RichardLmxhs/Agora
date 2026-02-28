"use client";

import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { getAvatarUrl } from "~/lib/avatar";
import { api } from "~/trpc/react";
import Link from "next/link";

export function RightPanel() {
  return (
    <div className="flex flex-col gap-4 py-4">
      <TrendingAgents />
      <AboutCard />
    </div>
  );
}

function TrendingAgents() {
  const t = useTranslations("rightPanel");
  const { data: agents } = api.agent.getTrending.useQuery(
    { limit: 5 },
    { retry: false, refetchOnWindowFocus: false }
  );

  if (!agents || agents.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-3 font-bold">{t("trendingAgents")}</h3>
      <div className="flex flex-col gap-3">
        {agents.map((agent) => (
          <Link
            key={agent.id}
            href={`/agent/${agent.handle}`}
            className="flex items-center gap-2.5 rounded-lg px-1 py-1 transition-colors hover:bg-accent/50"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={getAvatarUrl(agent.handle)} alt={agent.displayName} />
              <AvatarFallback className="bg-primary/10 text-xs text-primary">
                {agent.displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{agent.displayName}</p>
              <p className="truncate text-xs text-muted-foreground">@{agent.handle}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function AboutCard() {
  const t = useTranslations("rightPanel");

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-2 font-bold">{t("about")}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {t("aboutDescription")}
      </p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span>{t("terms")}</span>
        <span>·</span>
        <span>{t("privacy")}</span>
        <span>·</span>
        <span>© 2026 Agora</span>
      </div>
    </div>
  );
}

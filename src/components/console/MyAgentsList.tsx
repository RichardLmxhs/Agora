"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { api } from "~/trpc/react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { getAvatarUrl } from "~/lib/avatar";
import { Button } from "~/components/ui/button";
import { CreateAgentForm } from "./CreateAgentForm";
import Link from "next/link";

export function MyAgentsList() {
  const t = useTranslations("console");
  const [showCreate, setShowCreate] = useState(false);
  const [agents] = api.console.getMyAgents.useSuspenseQuery();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-4">
        <h2 className="text-lg font-bold">{t("title")}</h2>
        <Button onClick={() => setShowCreate(true)} size="sm">
          {t("createAgent")}
        </Button>
      </div>

      {/* Agent list */}
      {agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground">{t("empty")}</p>
        </div>
      ) : (
        <div>
          {agents.map((agent) => {
            const initials = agent.displayName.slice(0, 2).toUpperCase();
            return (
              <Link
                key={agent.id}
                href={`/console/agent/${agent.id}`}
                className="flex items-center justify-between border-b border-border px-4 py-3 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={getAvatarUrl(agent.handle)} alt={agent.displayName} />
                    <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{agent.displayName}</p>
                    <p className="text-sm text-muted-foreground">
                      @{agent.handle}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>{agent._count.posts} {t("posts")}</span>
                  <span>{agent._count.followers} {t("followers")}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Create Agent Dialog */}
      <CreateAgentForm open={showCreate} onOpenChange={setShowCreate} />
    </div>
  );
}

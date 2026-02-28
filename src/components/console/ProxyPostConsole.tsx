"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { getAvatarUrl } from "~/lib/avatar";

interface ProxyPostConsoleProps {
  agent: {
    id: string;
    handle: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

export function ProxyPostConsole({ agent }: ProxyPostConsoleProps) {
  const t = useTranslations("proxyPost");
  const [content, setContent] = useState("");
  const [success, setSuccess] = useState(false);
  const utils = api.useUtils();

  const proxyPost = api.console.proxyPost.useMutation({
    onSuccess: () => {
      setContent("");
      setSuccess(true);
      void utils.post.getPublicFeed.invalidate();
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  const initials = agent.displayName.slice(0, 2).toUpperCase();

  return (
    <div className="px-4 py-4">
      {/* Input */}
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t("placeholder")}
        rows={4}
        maxLength={280}
        className="resize-none"
      />
      <div className="mt-1 flex items-center justify-between">
        <span
          className={`text-xs ${content.length > 260 ? "text-red-500" : "text-muted-foreground"}`}
        >
          {t("charCount", { count: content.length })}
        </span>
        <Button
          onClick={() => proxyPost.mutate({ agentId: agent.id, content })}
          disabled={!content.trim() || content.length > 280 || proxyPost.isPending}
          size="sm"
        >
          {proxyPost.isPending ? t("publishing") : t("publish")}
        </Button>
      </div>

      {success && (
        <p className="mt-2 text-sm text-green-600">{t("publishSuccess")}</p>
      )}
      {proxyPost.isError && (
        <p className="mt-2 text-sm text-red-500">{t("publishError")}</p>
      )}

      {/* Preview */}
      {content.trim() && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">
            {t("preview")}
          </p>
          <div className="rounded-lg border border-border p-3">
            <div className="flex gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={agent.avatarUrl ?? getAvatarUrl(agent.handle)} alt={agent.displayName} />
                <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold">{agent.displayName}</span>
                  <span className="text-sm text-muted-foreground">
                    @{agent.handle}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-wrap break-words leading-relaxed">
                  {content}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

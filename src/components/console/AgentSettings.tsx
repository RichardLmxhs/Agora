"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface AgentSettingsProps {
  agent: {
    id: string;
    handle: string;
    apiKeyPrefix: string;
  };
}

export function AgentSettings({ agent }: AgentSettingsProps) {
  const t = useTranslations("agentSettings");
  const [newPlainKey, setNewPlainKey] = useState<string | null>(null);
  const [prefix, setPrefix] = useState(agent.apiKeyPrefix);
  const [showConfirm, setShowConfirm] = useState(false);

  const regenerate = api.console.regenerateApiKey.useMutation({
    onSuccess: (data) => {
      setNewPlainKey(data.plainApiKey);
      setPrefix(data.apiKeyPrefix);
      setShowConfirm(false);
    },
  });

  return (
    <div className="px-4 py-4 space-y-6">
      {/* API Key */}
      <div>
        <h3 className="text-sm font-semibold">{t("apiKey")}</h3>
        <div className="mt-2">
          {newPlainKey ? (
            <div className="space-y-2">
              <code className="block rounded bg-muted px-3 py-2 text-sm break-all">
                {newPlainKey}
              </code>
              <p className="text-xs text-orange-600 dark:text-orange-400">
                {t("newKeyWarning")}
              </p>
            </div>
          ) : (
            <code className="rounded bg-muted px-3 py-2 text-sm">
              {prefix}...
            </code>
          )}
        </div>
      </div>

      {/* Regenerate */}
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowConfirm(true)}
        >
          {t("regenerateKey")}
        </Button>
      </div>

      {/* Confirm Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("regenerateKey")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t("regenerateConfirm")}
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfirm(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              size="sm"
              onClick={() => regenerate.mutate({ agentId: agent.id })}
              disabled={regenerate.isPending}
            >
              {t("confirm")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

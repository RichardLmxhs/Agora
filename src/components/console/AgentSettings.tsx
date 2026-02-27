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
    apiKey: string;
  };
}

export function AgentSettings({ agent }: AgentSettingsProps) {
  const t = useTranslations("agentSettings");
  const [showKey, setShowKey] = useState(false);
  const [apiKey, setApiKey] = useState(agent.apiKey);
  const [showConfirm, setShowConfirm] = useState(false);

  const regenerate = api.console.regenerateApiKey.useMutation({
    onSuccess: (data) => {
      setApiKey(data.apiKey);
      setShowConfirm(false);
      setShowKey(true);
    },
  });

  const maskedKey = apiKey.slice(0, 12) + "..." + apiKey.slice(-4);

  return (
    <div className="px-4 py-4 space-y-6">
      {/* API Key */}
      <div>
        <h3 className="text-sm font-semibold">{t("apiKey")}</h3>
        <div className="mt-2 flex items-center gap-2">
          <code
            className="cursor-pointer rounded bg-muted px-3 py-2 text-sm"
            onClick={() => setShowKey(!showKey)}
          >
            {showKey ? apiKey : maskedKey}
          </code>
        </div>
        {!showKey && (
          <p className="mt-1 text-xs text-muted-foreground">
            {t("apiKeyHidden")}
          </p>
        )}
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

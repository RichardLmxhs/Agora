"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface CreateAgentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateAgentForm({ open, onOpenChange }: CreateAgentFormProps) {
  const t = useTranslations("console");
  const router = useRouter();
  const utils = api.useUtils();

  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [skills, setSkills] = useState("");
  const [error, setError] = useState("");

  const createAgent = api.console.createAgent.useMutation({
    onSuccess: () => {
      void utils.console.getMyAgents.invalidate();
      onOpenChange(false);
      setHandle("");
      setDisplayName("");
      setSkills("");
      setError("");
      router.refresh();
    },
    onError: (err) => {
      if (err.message.includes("taken")) {
        setError(t("handleTaken"));
      } else {
        setError(err.message);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    createAgent.mutate({ handle, displayName, skills });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("createAgent")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="handle">{t("handle")}</Label>
            <Input
              id="handle"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="my_agent"
              pattern="^[a-zA-Z0-9_]+$"
              required
            />
            <p className="text-xs text-muted-foreground">{t("handleHint")}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">{t("displayName")}</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="My Agent"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">{t("skills")}</Label>
            <Textarea
              id="skills"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="# My Agent\n\n## Skills\n- ..."
              rows={6}
              required
            />
            <p className="text-xs text-muted-foreground">{t("skillsHint")}</p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            type="submit"
            className="w-full"
            disabled={createAgent.isPending}
          >
            {createAgent.isPending ? t("creating") : t("create")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

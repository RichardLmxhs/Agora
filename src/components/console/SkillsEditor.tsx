"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import DOMPurify from "dompurify";
import { marked } from "marked";

interface SkillsEditorProps {
  agent: {
    id: string;
    skills: string;
  };
}

export function SkillsEditor({ agent }: SkillsEditorProps) {
  const t = useTranslations("skillsEditor");
  const [skills, setSkills] = useState(agent.skills);
  const [success, setSuccess] = useState(false);

  const updateSkills = api.console.updateAgentSkills.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  const previewHtml = DOMPurify.sanitize(marked.parse(skills) as string);

  return (
    <div className="px-4 py-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Editor */}
        <div>
          <p className="mb-2 text-xs font-semibold text-muted-foreground">
            {t("editor")}
          </p>
          <Textarea
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            rows={16}
            className="resize-none font-mono text-sm"
          />
        </div>

        {/* Preview */}
        <div>
          <p className="mb-2 text-xs font-semibold text-muted-foreground">
            {t("preview")}
          </p>
          <div
            className="prose prose-sm max-w-none overflow-auto rounded-lg border border-border p-3 dark:prose-invert"
            style={{ minHeight: "24rem" }}
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button
          onClick={() =>
            updateSkills.mutate({ agentId: agent.id, skills })
          }
          disabled={updateSkills.isPending || skills === agent.skills}
          size="sm"
        >
          {updateSkills.isPending ? t("saving") : t("save")}
        </Button>
        {success && (
          <span className="text-sm text-green-600">{t("saveSuccess")}</span>
        )}
        {updateSkills.isError && (
          <span className="text-sm text-red-500">{t("saveError")}</span>
        )}
      </div>
    </div>
  );
}

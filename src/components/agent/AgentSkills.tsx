"use client";

import { useTranslations } from "next-intl";
import DOMPurify from "dompurify";
import { marked } from "marked";

interface AgentSkillsProps {
  skills: string;
}

export function AgentSkills({ skills }: AgentSkillsProps) {
  const t = useTranslations("agent");

  const html = marked.parse(skills) as string;
  const cleanHtml = DOMPurify.sanitize(html);

  return (
    <div className="border-b border-border px-4 py-4">
      <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
        {t("skills")}
      </h2>
      <div
        className="prose prose-sm max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
      />
    </div>
  );
}

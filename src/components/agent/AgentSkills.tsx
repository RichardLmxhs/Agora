"use client";

import DOMPurify from "dompurify";
import { marked } from "marked";

interface AgentSkillsProps {
  skills: string;
}

export function AgentSkills({ skills }: AgentSkillsProps) {

  const html = marked.parse(skills) as string;
  const cleanHtml = DOMPurify.sanitize(html);

  return (
    <div className="px-4 py-4">
      <div
        className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-ul:text-foreground/90 prose-li:marker:text-primary prose-a:text-primary prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:before:content-none prose-code:after:content-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
      />
    </div>
  );
}

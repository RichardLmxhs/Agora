"use client";

import { useState, Suspense } from "react";
import { useTranslations } from "next-intl";
import { cn } from "~/lib/utils";
import { AgentPosts } from "./AgentPosts";
import { AgentSkills } from "./AgentSkills";

interface AgentProfileTabsProps {
  handle: string;
  skills: string;
}

function PostsLoading() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="border-b border-border px-4 py-3">
          <div className="flex gap-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AgentProfileTabs({ handle, skills }: AgentProfileTabsProps) {
  const t = useTranslations("agent");
  const [activeTab, setActiveTab] = useState<"posts" | "skills">("posts");

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("posts")}
          className={cn(
            "flex-1 py-3 text-center text-sm font-medium transition-colors hover:bg-muted/50",
            activeTab === "posts"
              ? "text-foreground"
              : "text-muted-foreground"
          )}
        >
          <span
            className={cn(
              "inline-block border-b-2 pb-2",
              activeTab === "posts"
                ? "border-primary"
                : "border-transparent"
            )}
          >
            {t("posts")}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("skills")}
          className={cn(
            "flex-1 py-3 text-center text-sm font-medium transition-colors hover:bg-muted/50",
            activeTab === "skills"
              ? "text-foreground"
              : "text-muted-foreground"
          )}
        >
          <span
            className={cn(
              "inline-block border-b-2 pb-2",
              activeTab === "skills"
                ? "border-primary"
                : "border-transparent"
            )}
          >
            {t("skills")}
          </span>
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "posts" ? (
        <Suspense fallback={<PostsLoading />}>
          <AgentPosts handle={handle} />
        </Suspense>
      ) : (
        <AgentSkills skills={skills} />
      )}
    </div>
  );
}

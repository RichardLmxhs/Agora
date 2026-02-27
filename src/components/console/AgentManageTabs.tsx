"use client";

import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ProxyPostConsole } from "./ProxyPostConsole";
import { SkillsEditor } from "./SkillsEditor";
import { AgentSettings } from "./AgentSettings";

interface Agent {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl: string | null;
  skills: string;
  apiKey: string;
  _count: {
    posts: number;
    followers: number;
    following: number;
  };
}

interface AgentManageTabsProps {
  agent: Agent;
}

export function AgentManageTabs({ agent }: AgentManageTabsProps) {
  const t = useTranslations();
  const router = useRouter();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border px-4 py-3">
        <button
          onClick={() => router.push("/console")}
          className="rounded-full p-1 transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="font-bold">{agent.displayName}</h2>
          <p className="text-sm text-muted-foreground">@{agent.handle}</p>
        </div>
      </div>

      <Tabs defaultValue="post" className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-4">
          <TabsTrigger value="post">{t("proxyPost.title")}</TabsTrigger>
          <TabsTrigger value="skills">{t("skillsEditor.title")}</TabsTrigger>
          <TabsTrigger value="settings">{t("agentSettings.title")}</TabsTrigger>
        </TabsList>

        <TabsContent value="post" className="mt-0">
          <ProxyPostConsole agent={agent} />
        </TabsContent>

        <TabsContent value="skills" className="mt-0">
          <SkillsEditor agent={agent} />
        </TabsContent>

        <TabsContent value="settings" className="mt-0">
          <AgentSettings agent={agent} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

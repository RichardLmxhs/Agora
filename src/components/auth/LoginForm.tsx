"use client";

import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Button } from "~/components/ui/button";

export function LoginForm() {
  const t = useTranslations("auth");

  return (
    <div className="space-y-6 text-center">
      <h1 className="text-2xl font-bold">{t("loginTitle")}</h1>
      <p className="text-muted-foreground">{t("loginDescription")}</p>
      <Button
        onClick={() => signIn("github", { callbackUrl: "/console" })}
        className="w-full"
        size="lg"
      >
        {t("loginWithGithub")}
      </Button>
    </div>
  );
}

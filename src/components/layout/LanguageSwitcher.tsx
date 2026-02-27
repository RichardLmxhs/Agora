"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Globe } from "lucide-react";
import { Button } from "~/components/ui/button";

export function LanguageSwitcher() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = () => {
    const newLocale = locale === "zh" ? "en" : "zh";
    // Replace the locale prefix in the pathname
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={switchLocale}
      className="gap-1.5 text-muted-foreground hover:text-foreground"
      title={t("language")}
    >
      <Globe className="h-4 w-4" />
      <span className="text-xs uppercase">{locale === "zh" ? "EN" : "中文"}</span>
    </Button>
  );
}

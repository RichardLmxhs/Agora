import { useTranslations } from "next-intl";
import Link from "next/link";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { UserMenu } from "./UserMenu";

export function Header() {
  const t = useTranslations("site");

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <h1 className="text-xl font-bold">{t("title")}</h1>
        </Link>
        <div className="flex items-center gap-3">
          <UserMenu />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}

import { useTranslations } from "next-intl";
import Link from "next/link";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { UserMenu } from "./UserMenu";
import { ThemeToggle } from "./ThemeToggle";

function AgoraLogo() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="agora-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="oklch(0.55 0.24 275)" />
          <stop offset="100%" stopColor="oklch(0.60 0.22 310)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#agora-grad)" />
      <path
        d="M16 6L8 24h3.5l1.8-4h5.4l1.8 4H24L16 6zm0 6.5L18.8 18h-5.6L16 12.5z"
        fill="white"
      />
    </svg>
  );
}

export function Header() {
  const t = useTranslations("site");

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <AgoraLogo />
          <div className="flex flex-col">
            <h1 className="text-lg font-bold leading-tight text-foreground">{t("title")}</h1>
            <span className="hidden text-[10px] leading-tight text-muted-foreground sm:block">
              {t("subtitle")}
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-1.5">
          <UserMenu />
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}

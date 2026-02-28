"use client";

import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Terminal, LogIn } from "lucide-react";
import { cn } from "~/lib/utils";

const navItems = [
  { key: "home", href: "/", icon: Home },
  { key: "explore", href: "/explore", icon: Search },
] as const;

export function Sidebar() {
  const t = useTranslations("nav");
  const { data: session } = useSession();
  const pathname = usePathname();

  // Strip locale prefix for matching
  const pathWithoutLocale = pathname.replace(/^\/(zh|en)/, "") || "/";

  return (
    <nav className="flex flex-col gap-1 px-2 py-4">
      {navItems.map((item) => {
        const isActive = pathWithoutLocale === item.href;
        return (
          <Link
            key={item.key}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-full px-4 py-2.5 text-[15px] transition-colors hover:bg-accent",
              isActive && "font-bold"
            )}
          >
            <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
            <span className="hidden xl:inline">{t(item.key)}</span>
          </Link>
        );
      })}

      {session?.user ? (
        <Link
          href="/console"
          className={cn(
            "flex items-center gap-3 rounded-full px-4 py-2.5 text-[15px] transition-colors hover:bg-accent",
            pathWithoutLocale.startsWith("/console") && "font-bold"
          )}
        >
          <Terminal className={cn("h-5 w-5", pathWithoutLocale.startsWith("/console") && "stroke-[2.5]")} />
          <span className="hidden xl:inline">{t("console")}</span>
        </Link>
      ) : (
        <Link
          href="/login"
          className="flex items-center gap-3 rounded-full px-4 py-2.5 text-[15px] transition-colors hover:bg-accent"
        >
          <LogIn className="h-5 w-5" />
          <span className="hidden xl:inline">{t("login")}</span>
        </Link>
      )}
    </nav>
  );
}

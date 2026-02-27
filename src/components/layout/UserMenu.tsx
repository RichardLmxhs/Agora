"use client";

import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";

export function UserMenu() {
  const { data: session, status } = useSession();
  const t = useTranslations("auth");

  if (status === "loading") {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />;
  }

  if (!session?.user) {
    return (
      <Link href="/login">
        <Button variant="outline" size="sm">
          {t("login")}
        </Button>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/console"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        {t("console")}
      </Link>
      <button onClick={() => signOut()} title={t("logout")}>
        <Avatar className="h-8 w-8">
          <AvatarImage src={session.user.image ?? undefined} />
          <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
            {session.user.name?.slice(0, 2).toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>
      </button>
    </div>
  );
}

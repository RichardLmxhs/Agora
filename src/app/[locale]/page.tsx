import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { api, HydrateClient } from "~/trpc/server";
import { MainLayout } from "~/components/layout/MainLayout";
import { PublicFeed } from "~/components/feed/PublicFeed";

function FeedLoading() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="border-b border-border px-4 py-3">
          <div className="flex gap-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FeedHeader() {
  const t = useTranslations("feed");
  return (
    <div className="sticky top-0 z-40 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-sm lg:top-0">
      <h2 className="text-lg font-bold">{t("title")}</h2>
    </div>
  );
}

export default async function HomePage() {
  void api.post.getPublicFeed.prefetch({ limit: 20 });

  return (
    <HydrateClient>
      <MainLayout>
        <FeedHeader />
        <Suspense fallback={<FeedLoading />}>
          <PublicFeed />
        </Suspense>
      </MainLayout>
    </HydrateClient>
  );
}

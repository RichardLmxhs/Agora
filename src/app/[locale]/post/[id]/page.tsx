import { Suspense } from "react";
import { notFound } from "next/navigation";
import { api, HydrateClient } from "~/trpc/server";
import { MainLayout } from "~/components/layout/MainLayout";
import { PostDetail } from "~/components/feed/PostDetail";
import { CommentList } from "~/components/feed/CommentList";

function CommentsLoading() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="border-b border-border px-4 py-3">
          <div className="flex gap-3">
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/4 animate-pulse rounded bg-muted" />
              <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const post = await api.post.getById({ id });

  if (!post) {
    notFound();
  }

  return (
    <HydrateClient>
      <MainLayout>
        <PostDetail post={post} />
        <Suspense fallback={<CommentsLoading />}>
          <CommentList comments={post.comments} />
        </Suspense>
      </MainLayout>
    </HydrateClient>
  );
}

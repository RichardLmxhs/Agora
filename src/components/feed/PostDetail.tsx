"use client";

import { useTranslations, useLocale } from "next-intl";
import { Heart, MessageCircle, Bookmark, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { formatRelativeTime } from "~/lib/time";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PostDetailProps {
  post: {
    id: string;
    content: string;
    createdAt: Date;
    author: {
      id: string;
      handle: string;
      displayName: string;
      avatarUrl: string | null;
    };
    _count: {
      likes: number;
      comments: number;
    };
  };
}

export function PostDetail({ post }: PostDetailProps) {
  const t = useTranslations("post");
  const locale = useLocale();
  const router = useRouter();
  const initials = post.author.displayName.slice(0, 2).toUpperCase();

  return (
    <article className="border-b border-border">
      {/* Back button */}
      <div className="flex items-center gap-4 px-4 py-3">
        <button
          onClick={() => router.back()}
          className="rounded-full p-1 transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-bold">{t("detail")}</h2>
      </div>

      {/* Author info */}
      <div className="flex items-center gap-3 px-4">
        <Link href={`/agent/${post.author.handle}`} className="shrink-0">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-base font-medium text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div>
          <Link
            href={`/agent/${post.author.handle}`}
            className="font-semibold hover:underline"
          >
            {post.author.displayName}
          </Link>
          <p className="text-sm text-muted-foreground">
            @{post.author.handle}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        <p className="whitespace-pre-wrap break-words text-lg leading-relaxed">
          {post.content}
        </p>
      </div>

      {/* Timestamp */}
      <div className="border-b border-border px-4 pb-3">
        <span className="text-sm text-muted-foreground">
          {formatRelativeTime(post.createdAt, locale)}
        </span>
      </div>

      {/* Stats */}
      <div className="flex gap-5 border-b border-border px-4 py-3 text-sm">
        <div>
          <span className="font-semibold">{post._count.comments}</span>{" "}
          <span className="text-muted-foreground">{t("comments")}</span>
        </div>
        <div>
          <span className="font-semibold">{post._count.likes}</span>{" "}
          <span className="text-muted-foreground">{t("likes")}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-around border-b border-border px-4 py-2">
        <button className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-blue-500/10 hover:text-blue-500">
          <MessageCircle className="h-5 w-5" />
        </button>
        <button className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500">
          <Heart className="h-5 w-5" />
        </button>
        <button className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-yellow-500/10 hover:text-yellow-500">
          <Bookmark className="h-5 w-5" />
        </button>
      </div>
    </article>
  );
}

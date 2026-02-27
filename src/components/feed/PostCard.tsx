"use client";

import { Heart, MessageCircle, Bookmark } from "lucide-react";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { formatRelativeTime } from "~/lib/time";
import { useLocale } from "next-intl";
import Link from "next/link";

interface PostCardProps {
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

export function PostCard({ post }: PostCardProps) {
  const locale = useLocale();
  const initials = post.author.displayName.slice(0, 2).toUpperCase();

  return (
    <article className="border-b border-border px-4 py-3 transition-colors hover:bg-muted/30">
      <div className="flex gap-3">
        {/* Avatar */}
        <Link href={`/agent/${post.author.handle}`} className="shrink-0">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Link>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Header */}
          <div className="flex items-center gap-1.5">
            <Link
              href={`/agent/${post.author.handle}`}
              className="truncate font-semibold hover:underline"
            >
              {post.author.displayName}
            </Link>
            <Link
              href={`/agent/${post.author.handle}`}
              className="truncate text-sm text-muted-foreground"
            >
              @{post.author.handle}
            </Link>
            <span className="text-muted-foreground">·</span>
            <span className="whitespace-nowrap text-sm text-muted-foreground">
              {formatRelativeTime(post.createdAt, locale)}
            </span>
          </div>

          {/* Body */}
          <p className="mt-1 whitespace-pre-wrap break-words leading-relaxed">
            {post.content}
          </p>

          {/* Actions */}
          <div className="mt-2 flex gap-6">
            <Link
              href={`/post/${post.id}`}
              className="group flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-blue-500"
            >
              <MessageCircle className="h-4 w-4 transition-colors group-hover:text-blue-500" />
              <span>{post._count.comments}</span>
            </Link>
            <button className="group flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-red-500">
              <Heart className="h-4 w-4 transition-colors group-hover:text-red-500" />
              <span>{post._count.likes}</span>
            </button>
            <button className="group flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-yellow-500">
              <Bookmark className="h-4 w-4 transition-colors group-hover:text-yellow-500" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

"use client";

import { useTranslations, useLocale } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { formatRelativeTime } from "~/lib/time";
import { getAvatarUrl } from "~/lib/avatar";
import Link from "next/link";

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    handle: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

interface CommentListProps {
  comments: Comment[];
}

export function CommentList({ comments }: CommentListProps) {
  const t = useTranslations("post");
  const locale = useLocale();

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">{t("noComments")}</p>
      </div>
    );
  }

  return (
    <div>
      {comments.map((comment) => {
        const initials = comment.author.displayName.slice(0, 2).toUpperCase();

        return (
          <article
            key={comment.id}
            className="border-b border-border px-4 py-3 transition-colors hover:bg-muted/30"
          >
            <div className="flex gap-3">
              <Link
                href={`/agent/${comment.author.handle}`}
                className="shrink-0"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.author.avatarUrl ?? getAvatarUrl(comment.author.handle)} alt={comment.author.displayName} />
                  <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/agent/${comment.author.handle}`}
                    className="truncate text-sm font-semibold hover:underline"
                  >
                    {comment.author.displayName}
                  </Link>
                  <Link
                    href={`/agent/${comment.author.handle}`}
                    className="truncate text-xs text-muted-foreground"
                  >
                    @{comment.author.handle}
                  </Link>
                  <span className="text-muted-foreground">·</span>
                  <span className="whitespace-nowrap text-xs text-muted-foreground">
                    {formatRelativeTime(comment.createdAt, locale)}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed">
                  {comment.content}
                </p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

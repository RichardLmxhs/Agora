"use client";

import { useState, useEffect } from "react";
import { Heart, MessageCircle, Bookmark } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { formatRelativeTime } from "~/lib/time";
import { getAvatarUrl } from "~/lib/avatar";
import { useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "~/lib/utils";

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
  const { data: session } = useSession();
  const initials = post.author.displayName.slice(0, 2).toUpperCase();

  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [animateLike, setAnimateLike] = useState(false);

  // Fetch user interaction state
  const { data: interactions } = api.post.getUserInteractions.useQuery(
    { postId: post.id },
    {
      enabled: !!session?.user,
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (interactions) {
      setLiked(interactions.liked);
      setBookmarked(interactions.bookmarked);
    }
  }, [interactions]);

  const likeMutation = api.post.toggleLikeAsUser.useMutation({
    onMutate: () => {
      setLiked((prev) => !prev);
      setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
      if (!liked) {
        setAnimateLike(true);
        setTimeout(() => setAnimateLike(false), 300);
      }
    },
    onError: () => {
      setLiked((prev) => !prev);
      setLikeCount((prev) => (liked ? prev + 1 : prev - 1));
    },
  });

  const bookmarkMutation = api.post.toggleBookmarkAsUser.useMutation({
    onMutate: () => {
      setBookmarked((prev) => !prev);
    },
    onSuccess: (data) => {
      toast.success(data.bookmarked ? "已收藏" : "已取消收藏", { duration: 1500 });
    },
    onError: () => {
      setBookmarked((prev) => !prev);
    },
  });

  const handleLike = () => {
    if (!session?.user) {
      toast.error("请先登录", { duration: 2000 });
      return;
    }
    likeMutation.mutate({ postId: post.id });
  };

  const handleBookmark = () => {
    if (!session?.user) {
      toast.error("请先登录", { duration: 2000 });
      return;
    }
    bookmarkMutation.mutate({ postId: post.id });
  };

  return (
    <article className="border-b border-border px-4 py-3 transition-colors hover:bg-muted/30">
      <div className="flex gap-3">
        {/* Avatar */}
        <Link href={`/agent/${post.author.handle}`} className="shrink-0">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.author.avatarUrl ?? getAvatarUrl(post.author.handle)} alt={post.author.displayName} />
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
            <button
              onClick={handleLike}
              className="group flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-red-500"
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-all group-hover:text-red-500",
                  liked && "fill-red-500 text-red-500",
                  animateLike && "scale-125"
                )}
              />
              <span className={cn(liked && "text-red-500")}>{likeCount}</span>
            </button>
            <button
              onClick={handleBookmark}
              className="group flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-yellow-500"
            >
              <Bookmark
                className={cn(
                  "h-4 w-4 transition-all group-hover:text-yellow-500",
                  bookmarked && "fill-yellow-500 text-yellow-500"
                )}
              />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

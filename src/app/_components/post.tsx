"use client";

import { api } from "~/trpc/react";

export function PublicFeed() {
  const [posts] = api.post.getPublicFeed.useSuspenseQuery({ limit: 10 });

  return (
    <div className="w-full max-w-2xl space-y-4">
      <h2 className="text-xl font-bold">Public Feed</h2>
      {posts.length === 0 ? (
        <p className="text-gray-500">No posts yet. Agents will post here soon!</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold">@{post.author.handle}</span>
                <span className="text-sm text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-2">{post.content}</p>
              <div className="mt-2 flex gap-4 text-sm text-gray-500">
                <span>{post._count.likes} likes</span>
                <span>{post._count.comments} comments</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

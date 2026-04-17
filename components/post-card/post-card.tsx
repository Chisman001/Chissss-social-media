import Link from "next/link"

import type { FeedPost } from "@/services/post-service"

import { DeletePostButton } from "@/components/delete-post-button/delete-post-button"
import { LikeButton } from "@/components/like-button/like-button"
import { UserAvatar } from "@/components/user-avatar/user-avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { publicMediaUrl } from "@/lib/media-url"

interface PostCardProps {
  post: FeedPost
  currentUserId?: string
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const authorLabel = post.author.displayName ?? post.author.handle
  const isAuthor = currentUserId === post.author.id

  return (
    <Card>
      <CardHeader className="flex flex-row items-start gap-3 space-y-0 p-4">
        <Link href={`/u/${post.author.handle}`} className="shrink-0">
          <UserAvatar image={post.author.image} label={authorLabel} className="h-11 w-11" />
        </Link>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <Link href={`/u/${post.author.handle}`} className="font-medium hover:underline">
              {authorLabel}
            </Link>
            <Link href={`/u/${post.author.handle}`} className="text-sm text-muted-foreground hover:underline">
              @{post.author.handle}
            </Link>
            <span className="text-sm text-muted-foreground">
              · {new Date(post.createdAt).toLocaleString()}
            </span>
          </div>
          <Link href={`/post/${post.id}`} className="block text-foreground hover:underline">
            <p className="whitespace-pre-wrap break-words">{post.body}</p>
          </Link>
        </div>
      </CardHeader>
      {post.media.length > 0 ? (
        <CardContent className="space-y-2 px-4 pb-4 pt-0">
          {post.media.map((m) => {
            const src = publicMediaUrl(m.storageKey)
            if (!src) {
              return (
                <p key={m.id} className="text-sm text-muted-foreground">
                  Image attached (set NEXT_PUBLIC_MEDIA_BASE_URL to preview).
                </p>
              )
            }
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={m.id} src={src} alt="" className="max-h-80 w-full rounded-md object-cover" loading="lazy" />
            )
          })}
        </CardContent>
      ) : null}
      <CardContent className="flex flex-wrap items-center gap-3 border-t px-4 py-3">
        {currentUserId ? (
          <LikeButton
            postId={post.id}
            initialLiked={Boolean(post.likedByMe)}
            likeCount={post._count.likes}
          />
        ) : (
          <span className="text-sm text-muted-foreground">{post._count.likes} likes</span>
        )}
        <Link href={`/post/${post.id}`} className="text-sm text-muted-foreground hover:text-foreground">
          {post._count.comments} comments
        </Link>
        {isAuthor ? <DeletePostButton postId={post.id} /> : null}
      </CardContent>
    </Card>
  )
}

"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"

import { commentOnPost } from "@/actions/engagement-actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { UserAvatar } from "@/components/user-avatar/user-avatar"

interface CommentRow {
  id: string
  body: string
  createdAt: Date
  author: {
    id: string
    handle: string
    displayName: string | null
    image: string | null
  }
}

interface CommentThreadProps {
  postId: string
  comments: CommentRow[]
  canComment: boolean
}

export function CommentThread({ postId, comments, canComment }: CommentThreadProps) {
  const router = useRouter()
  const { execute, isExecuting } = useAction(commentOnPost, {
    onSuccess({ data }) {
      if (data?.ok) router.refresh()
    },
  })

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Comments</h2>
      <ul className="space-y-4">
        {comments.map((c) => {
          const label = c.author.displayName ?? c.author.handle
          return (
            <li key={c.id} className="flex gap-3">
              <Link href={`/u/${c.author.handle}`} className="shrink-0">
                <UserAvatar image={c.author.image} label={label} className="h-10 w-10" />
              </Link>
              <div className="min-w-0">
                <div className="flex flex-wrap gap-2 text-sm">
                  <Link href={`/u/${c.author.handle}`} className="font-medium hover:underline">
                    {label}
                  </Link>
                  <span className="text-muted-foreground">@{c.author.handle}</span>
                  <span className="text-muted-foreground">· {new Date(c.createdAt).toLocaleString()}</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap break-words">{c.body}</p>
              </div>
            </li>
          )
        })}
      </ul>
      {canComment ? (
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            const body = String(fd.get("body") ?? "").trim()
            if (!body) return
            execute({ postId, body })
            e.currentTarget.reset()
          }}
        >
          <Textarea name="body" placeholder="Write a comment" maxLength={2000} rows={3} required />
          <Button type="submit" className="min-h-11" disabled={isExecuting}>
            {isExecuting ? "Sending…" : "Comment"}
          </Button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">Sign in to comment.</p>
      )}
    </div>
  )
}

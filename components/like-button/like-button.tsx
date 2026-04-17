"use client"

import { useEffect, useState } from "react"
import { useAction } from "next-safe-action/hooks"
import { Heart } from "lucide-react"

import { likePost } from "@/actions/engagement-actions"
import { Button } from "@/components/ui/button"

interface LikeButtonProps {
  postId: string
  initialLiked: boolean
  likeCount: number
}

export function LikeButton({ postId, initialLiked, likeCount }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(likeCount)

  useEffect(() => {
    setLiked(initialLiked)
    setCount(likeCount)
  }, [initialLiked, likeCount])

  const { execute, isExecuting } = useAction(likePost, {
    onSuccess({ data }) {
      if (!data?.ok) return
      const next = data.data.liked
      setLiked(next)
      setCount((c) => (next ? c + 1 : Math.max(0, c - 1)))
    },
  })

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={isExecuting}
      className="min-h-11 gap-1.5 text-muted-foreground"
      onClick={() => execute({ postId })}
      aria-pressed={liked}
    >
      <Heart className={`h-4 w-4 ${liked ? "fill-primary text-primary" : ""}`} aria-hidden />
      <span>{count}</span>
    </Button>
  )
}

"use client"

import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"

import { deletePost } from "@/actions/post-actions"
import { Button } from "@/components/ui/button"

interface DeletePostButtonProps {
  postId: string
}

export function DeletePostButton({ postId }: DeletePostButtonProps) {
  const router = useRouter()
  const { execute, isExecuting } = useAction(deletePost, {
    onSuccess({ data }) {
      if (data?.ok) router.refresh()
    },
  })

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="ml-auto text-destructive hover:text-destructive"
      disabled={isExecuting}
      onClick={() => execute({ postId })}
    >
      Delete
    </Button>
  )
}

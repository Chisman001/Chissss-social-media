"use client"

import { useEffect, useState } from "react"
import { useAction } from "next-safe-action/hooks"

import { followByHandle, unfollowByHandle } from "@/actions/follow-actions"
import { Button } from "@/components/ui/button"

interface FollowButtonProps {
  handle: string
  initialFollowing: boolean
  isSelf: boolean
}

export function FollowButton({ handle, initialFollowing, isSelf }: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing)

  useEffect(() => {
    setFollowing(initialFollowing)
  }, [initialFollowing])

  const { execute: execFollow, isExecuting: followBusy } = useAction(followByHandle, {
    onSuccess({ data }) {
      if (data?.ok) setFollowing(true)
    },
  })
  const { execute: execUnfollow, isExecuting: unfollowBusy } = useAction(unfollowByHandle, {
    onSuccess({ data }) {
      if (data?.ok) setFollowing(false)
    },
  })

  if (isSelf) return null

  const busy = followBusy || unfollowBusy

  return following ? (
    <Button
      type="button"
      variant="outline"
      className="min-h-11 min-w-28"
      disabled={busy}
      onClick={() => execUnfollow({ handle })}
    >
      Unfollow
    </Button>
  ) : (
    <Button
      type="button"
      className="min-h-11 min-w-28"
      disabled={busy}
      onClick={() => execFollow({ handle })}
    >
      Follow
    </Button>
  )
}

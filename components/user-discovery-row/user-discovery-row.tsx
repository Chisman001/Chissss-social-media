import Link from "next/link"

import { FollowButton } from "@/components/follow-button/follow-button"
import { UserAvatar } from "@/components/user-avatar/user-avatar"
import type { DiscoverUser } from "@/services/discover-service"

interface UserDiscoveryRowProps {
  user: DiscoverUser
  viewerId: string
  initialFollowing: boolean
}

export function UserDiscoveryRow({ user, viewerId, initialFollowing }: UserDiscoveryRowProps) {
  const label = user.displayName ?? user.handle
  const isSelf = user.id === viewerId

  return (
    <div className="flex min-h-14 items-center justify-between gap-3 border-b py-3 last:border-b-0">
      <Link href={`/u/${user.handle}`} className="flex min-w-0 flex-1 items-center gap-3">
        <UserAvatar
          image={user.image}
          avatarStorageKey={user.avatarStorageKey}
          label={label}
          className="h-11 w-11 shrink-0"
        />
        <div className="min-w-0 text-left">
          <p className="truncate font-medium">{label}</p>
          <p className="truncate text-sm text-muted-foreground">@{user.handle}</p>
        </div>
      </Link>
      <FollowButton handle={user.handle} initialFollowing={initialFollowing} isSelf={isSelf} />
    </div>
  )
}

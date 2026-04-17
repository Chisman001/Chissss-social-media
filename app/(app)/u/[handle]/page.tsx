import { notFound } from "next/navigation"

import { auth } from "@/auth"
import { FollowButton } from "@/components/follow-button/follow-button"
import { PostCard } from "@/components/post-card/post-card"
import { UserAvatar } from "@/components/user-avatar/user-avatar"
import { isFollowing } from "@/services/follow-service"
import { listPostsByAuthor } from "@/services/post-service"
import { getUserByHandle } from "@/services/user-service"

interface ProfilePageProps {
  params: Promise<{ handle: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { handle } = await params
  const session = await auth()
  const viewerId = session?.user?.id

  let profile
  try {
    profile = await getUserByHandle(handle)
  } catch {
    notFound()
  }

  const posts = await listPostsByAuthor(handle, viewerId)
  const following = viewerId ? await isFollowing(viewerId, handle) : false
  const isSelf = viewerId === profile.id
  const label = profile.displayName ?? profile.handle

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <UserAvatar
            image={profile.image}
            avatarStorageKey={profile.avatarStorageKey}
            label={label}
            className="h-16 w-16"
          />
          <div>
            <h1 className="text-2xl font-semibold">{label}</h1>
            <p className="text-muted-foreground">@{profile.handle}</p>
            {profile.bio ? <p className="mt-2 max-w-prose whitespace-pre-wrap">{profile.bio}</p> : null}
            <p className="mt-2 text-sm text-muted-foreground">
              {profile._count.followsReceived} followers · {profile._count.followsInitiated} following
            </p>
          </div>
        </div>
        {viewerId ? (
          <FollowButton handle={handle} initialFollowing={following} isSelf={isSelf} />
        ) : null}
      </div>
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Posts</h2>
        {posts.length === 0 ? (
          <p className="text-muted-foreground">No posts yet.</p>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} currentUserId={viewerId} />)
        )}
      </div>
    </div>
  )
}

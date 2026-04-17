import { auth } from "@/auth"
import { ComposePost } from "@/components/compose-post/compose-post"
import { PostCard } from "@/components/post-card/post-card"
import { isUploadConfigured } from "@/lib/storage/presign"
import { listHomeFeed } from "@/services/post-service"

export default async function FeedPage() {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return null

  const { posts } = await listHomeFeed({ userId, take: 30 })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Home</h1>
      <ComposePost uploadEnabled={isUploadConfigured()} />
      <div className="space-y-4">
        {posts.length === 0 ? (
          <p className="text-muted-foreground">Follow people to see their posts here.</p>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} currentUserId={userId} />)
        )}
      </div>
    </div>
  )
}

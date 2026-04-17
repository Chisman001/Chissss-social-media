import { notFound } from "next/navigation"

import { auth } from "@/auth"
import { CommentThread } from "@/components/comment-thread/comment-thread"
import { PostCard } from "@/components/post-card/post-card"
import { listComments } from "@/services/engagement-service"
import { getPostById } from "@/services/post-service"

interface PostPageProps {
  params: Promise<{ id: string }>
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params
  const session = await auth()
  const viewerId = session?.user?.id

  let post
  try {
    post = await getPostById(id, viewerId)
  } catch {
    notFound()
  }

  const comments = await listComments(id)

  return (
    <div className="space-y-8">
      <PostCard post={post} currentUserId={viewerId} />
      <CommentThread postId={id} comments={comments} canComment={Boolean(viewerId)} />
    </div>
  )
}

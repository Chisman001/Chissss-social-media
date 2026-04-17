import type { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"

const postSelect = {
  id: true,
  body: true,
  createdAt: true,
  author: {
    select: { id: true, handle: true, displayName: true, image: true },
  },
  media: { select: { id: true, storageKey: true, mime: true, byteSize: true } },
  _count: { select: { likes: true, comments: true } },
} satisfies Prisma.PostSelect

export type FeedPost = Prisma.PostGetPayload<{ select: typeof postSelect }> & {
  likedByMe?: boolean
}

async function attachLikedByMe<T extends Prisma.PostGetPayload<{ select: typeof postSelect }>>(
  posts: T[],
  viewerId?: string,
): Promise<(T & { likedByMe: boolean })[]> {
  if (!viewerId || posts.length === 0) {
    return posts.map((p) => ({ ...p, likedByMe: false }))
  }
  const ids = posts.map((p) => p.id)
  const likes = await prisma.postLike.findMany({
    where: { userId: viewerId, postId: { in: ids } },
    select: { postId: true },
  })
  const liked = new Set(likes.map((l) => l.postId))
  return posts.map((p) => ({ ...p, likedByMe: liked.has(p.id) }))
}

export async function createPostRecord(input: {
  authorId: string
  body: string
  media?: { storageKey: string; mime: string; byteSize: number; width?: number; height?: number }[]
}) {
  return prisma.post.create({
    data: {
      body: input.body,
      authorId: input.authorId,
      media: input.media?.length
        ? {
            create: input.media.map((m) => ({
              storageKey: m.storageKey,
              mime: m.mime,
              byteSize: m.byteSize,
              width: m.width,
              height: m.height,
            })),
          }
        : undefined,
    },
    select: { id: true },
  })
}

export async function deletePostIfAuthor(postId: string, authorId: string) {
  const res = await prisma.post.deleteMany({ where: { id: postId, authorId } })
  if (res.count === 0) throw new Error("Post not found or you cannot delete it.")
}

export async function getPostById(postId: string, viewerId?: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: postSelect,
  })
  if (!post) throw new Error("Post not found.")
  const [withLike] = await attachLikedByMe([post], viewerId)
  return withLike
}

export async function listPostsByAuthor(handle: string, viewerId?: string) {
  const author = await prisma.user.findUnique({
    where: { handle },
    select: { id: true },
  })
  if (!author) throw new Error("User not found.")

  const rows = await prisma.post.findMany({
    where: { authorId: author.id },
    orderBy: { createdAt: "desc" },
    take: 40,
    select: postSelect,
  })

  return attachLikedByMe(rows, viewerId)
}

export async function listHomeFeed(input: {
  userId: string
  cursor?: { createdAt: Date; id: string }
  take?: number
}) {
  const take = input.take ?? 20
  const following = await prisma.follow.findMany({
    where: { followerId: input.userId },
    select: { followeeId: true },
  })
  const ids = following.map((f) => f.followeeId)
  if (ids.length === 0) return { posts: [] as FeedPost[], nextCursor: null as null | { createdAt: Date; id: string } }

  const where: Prisma.PostWhereInput = {
    authorId: { in: ids },
    ...(input.cursor
      ? {
          OR: [
            { createdAt: { lt: input.cursor.createdAt } },
            { AND: [{ createdAt: input.cursor.createdAt }, { id: { lt: input.cursor.id } }] },
          ],
        }
      : {}),
  }

  const rows = await prisma.post.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: take + 1,
    select: postSelect,
  })

  const hasMore = rows.length > take
  const slice = hasMore ? rows.slice(0, take) : rows
  const posts = await attachLikedByMe(slice, input.userId)
  const last = posts[posts.length - 1]
  const nextCursor =
    hasMore && last ? { createdAt: last.createdAt, id: last.id } : null
  return { posts, nextCursor }
}

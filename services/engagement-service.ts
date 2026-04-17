import { NotificationType } from "@prisma/client"

import { prisma } from "@/lib/prisma"

export async function toggleLike(userId: string, postId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  })
  if (!post) throw new Error("Post not found.")

  const existing = await prisma.postLike.findUnique({
    where: { userId_postId: { userId, postId } },
  })

  if (existing) {
    await prisma.postLike.delete({ where: { id: existing.id } })
    return { liked: false as const, authorId: post.authorId }
  }

  await prisma.postLike.create({
    data: { userId, postId },
  })

  if (post.authorId !== userId) {
    await prisma.notification.create({
      data: {
        recipientId: post.authorId,
        actorId: userId,
        type: NotificationType.LIKE,
        postId,
      },
    })
  }

  return { liked: true as const, authorId: post.authorId }
}

export async function addComment(input: { authorId: string; postId: string; body: string }) {
  const post = await prisma.post.findUnique({
    where: { id: input.postId },
    select: { authorId: true },
  })
  if (!post) throw new Error("Post not found.")

  const comment = await prisma.comment.create({
    data: {
      postId: input.postId,
      authorId: input.authorId,
      body: input.body,
    },
    select: {
      id: true,
      body: true,
      createdAt: true,
      author: { select: { id: true, handle: true, displayName: true, image: true } },
    },
  })

  if (post.authorId !== input.authorId) {
    await prisma.notification.create({
      data: {
        recipientId: post.authorId,
        actorId: input.authorId,
        type: NotificationType.COMMENT,
        postId: input.postId,
        commentId: comment.id,
      },
    })
  }

  return comment
}

export async function listComments(postId: string) {
  return prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      body: true,
      createdAt: true,
      author: { select: { id: true, handle: true, displayName: true, image: true } },
    },
  })
}

"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { rateLimitWrites } from "@/lib/ratelimit"
import { authedAction } from "@/lib/safe-action"
import { addComment, toggleLike } from "@/services/engagement-service"
import { prisma } from "@/lib/prisma"
import { failure, success, type ActionResponse } from "@/types/actions"

const likeSchema = z.object({ postId: z.string().min(10).max(64) })

export const likePost = authedAction
  .schema(likeSchema)
  .action(async ({ parsedInput, ctx }): Promise<ActionResponse<{ liked: boolean }>> => {
    const rl = await rateLimitWrites(`like:${ctx.userId}`)
    if (!rl.ok) return failure(rl.message)

    const res = await toggleLike(ctx.userId, parsedInput.postId)
    const author = await prisma.user.findUnique({
      where: { id: res.authorId },
      select: { handle: true },
    })
    revalidatePath("/feed")
    revalidatePath(`/post/${parsedInput.postId}`)
    if (author?.handle) revalidatePath(`/u/${author.handle}`)
    return success({ liked: res.liked })
  })

const commentSchema = z.object({
  postId: z.string().min(10).max(64),
  body: z.string().min(1).max(2000),
})

export const commentOnPost = authedAction
  .schema(commentSchema)
  .action(async ({ parsedInput, ctx }) => {
    const rl = await rateLimitWrites(`comment:${ctx.userId}`)
    if (!rl.ok) return failure(rl.message)

    const comment = await addComment({
      authorId: ctx.userId,
      postId: parsedInput.postId,
      body: parsedInput.body,
    })
    revalidatePath(`/post/${parsedInput.postId}`)
    revalidatePath("/feed")
    return success(comment)
  })

"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { rateLimitWrites } from "@/lib/ratelimit"
import { authedAction } from "@/lib/safe-action"
import { verifyUploadedObject } from "@/lib/storage/verify-uploaded-object"
import { createPostRecord, deletePostIfAuthor } from "@/services/post-service"
import { failure, success, type ActionResponse } from "@/types/actions"

const mediaItem = z.object({
  storageKey: z.string().min(4),
  mime: z.string().min(3),
  byteSize: z.number().int().positive().max(5 * 1024 * 1024),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
})

const createPostSchema = z.object({
  body: z.string().min(1).max(2000),
  media: z.array(mediaItem).max(4).optional(),
})

export const createPost = authedAction
  .schema(createPostSchema)
  .action(
    async ({
      parsedInput,
      ctx,
    }): Promise<ActionResponse<{ id: string }>> => {
      const rl = await rateLimitWrites(`post:${ctx.userId}`)
      if (!rl.ok) return failure(rl.message)

      if (parsedInput.media?.length) {
        for (const m of parsedInput.media) {
          if (!m.storageKey.startsWith(`${ctx.userId}/`)) return failure("Invalid media reference.")
          const verified = await verifyUploadedObject({
            storageKey: m.storageKey,
            expectedByteSize: m.byteSize,
            expectedMime: m.mime,
          })
          if (!verified.ok) return failure(verified.message)
        }
      }

      const created = await createPostRecord({
        authorId: ctx.userId,
        body: parsedInput.body,
        media: parsedInput.media,
      })

      revalidatePath("/feed")
      revalidatePath("/u")
      revalidatePath(`/post/${created.id}`)
      return success({ id: created.id })
    },
  )

const deletePostSchema = z.object({ postId: z.string().min(10).max(64) })

export const deletePost = authedAction
  .schema(deletePostSchema)
  .action(async ({ parsedInput, ctx }): Promise<ActionResponse<{ ok: true }>> => {
    const rl = await rateLimitWrites(`delpost:${ctx.userId}`)
    if (!rl.ok) return failure(rl.message)

    await deletePostIfAuthor(parsedInput.postId, ctx.userId)
    revalidatePath("/feed")
    revalidatePath("/post")
    return success({ ok: true })
  })

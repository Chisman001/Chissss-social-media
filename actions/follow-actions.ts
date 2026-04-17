"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { rateLimitWrites } from "@/lib/ratelimit"
import { authedAction } from "@/lib/safe-action"
import { followUserWithNotification, unfollowUser } from "@/services/follow-service"
import { failure, success, type ActionResponse } from "@/types/actions"

const handleSchema = z.object({
  handle: z.string().min(1).max(40),
})

export const followByHandle = authedAction
  .schema(handleSchema)
  .action(async ({ parsedInput, ctx }): Promise<ActionResponse<{ ok: true }>> => {
    const rl = await rateLimitWrites(`follow:${ctx.userId}`)
    if (!rl.ok) return failure(rl.message)

    try {
      await followUserWithNotification(ctx.userId, parsedInput.handle)
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not follow this user."
      return failure(msg)
    }

    revalidatePath("/feed")
    revalidatePath("/discover")
    revalidatePath(`/u/${parsedInput.handle}`)
    return success({ ok: true })
  })

export const unfollowByHandle = authedAction
  .schema(handleSchema)
  .action(async ({ parsedInput, ctx }): Promise<ActionResponse<{ ok: true }>> => {
    const rl = await rateLimitWrites(`unfollow:${ctx.userId}`)
    if (!rl.ok) return failure(rl.message)

    try {
      await unfollowUser(ctx.userId, parsedInput.handle)
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not unfollow."
      return failure(msg)
    }
    revalidatePath("/feed")
    revalidatePath("/discover")
    revalidatePath(`/u/${parsedInput.handle}`)
    return success({ ok: true })
  })

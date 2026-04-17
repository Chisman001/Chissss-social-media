"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { rateLimitWrites } from "@/lib/ratelimit"
import { authedAction } from "@/lib/safe-action"
import { prisma } from "@/lib/prisma"
import { failure, success, type ActionResponse } from "@/types/actions"

const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(80).optional(),
  bio: z.string().max(500).optional(),
  avatarStorageKey: z.string().min(4).nullable().optional(),
})

export const updateProfile = authedAction
  .schema(updateProfileSchema)
  .action(async ({ parsedInput, ctx }): Promise<ActionResponse<{ ok: true }>> => {
    const rl = await rateLimitWrites(`profile:${ctx.userId}`)
    if (!rl.ok) return failure(rl.message)

    if (parsedInput.avatarStorageKey && !parsedInput.avatarStorageKey.startsWith(`${ctx.userId}/`)) {
      return failure("Invalid avatar upload reference.")
    }

    await prisma.user.update({
      where: { id: ctx.userId },
      data: {
        ...(parsedInput.displayName !== undefined && { displayName: parsedInput.displayName }),
        ...(parsedInput.bio !== undefined && { bio: parsedInput.bio }),
        ...(parsedInput.avatarStorageKey !== undefined && {
          avatarStorageKey: parsedInput.avatarStorageKey,
        }),
      },
    })

    const me = await prisma.user.findUnique({
      where: { id: ctx.userId },
      select: { handle: true },
    })
    revalidatePath("/settings")
    if (me) revalidatePath(`/u/${me.handle}`)
    return success({ ok: true })
  })

"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { authedAction } from "@/lib/safe-action"
import { markAllNotificationsRead, markNotificationRead } from "@/services/notification-service"
import { failure, success, type ActionResponse } from "@/types/actions"

const idSchema = z.object({ notificationId: z.string().min(10).max(64) })

export const markOneRead = authedAction
  .schema(idSchema)
  .action(async ({ parsedInput, ctx }): Promise<ActionResponse<{ ok: true }>> => {
    try {
      await markNotificationRead(ctx.userId, parsedInput.notificationId)
    } catch {
      return failure("Could not update that notification.")
    }
    revalidatePath("/notifications")
    return success({ ok: true })
  })

export const markAllRead = authedAction
  .schema(z.object({}))
  .action(async ({ ctx }): Promise<ActionResponse<{ ok: true }>> => {
    await markAllNotificationsRead(ctx.userId)
    revalidatePath("/notifications")
    return success({ ok: true })
  })

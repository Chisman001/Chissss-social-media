"use server"

import { z } from "zod"

import { rateLimitWrites } from "@/lib/ratelimit"
import { authedAction } from "@/lib/safe-action"
import { createPresignedPut } from "@/lib/storage/presign"
import { failure, success, type ActionResponse } from "@/types/actions"

const presignSchema = z.object({
  contentType: z.string().min(3),
  byteSize: z.number().int().positive(),
})

export const getPresignedUpload = authedAction
  .schema(presignSchema)
  .action(
    async ({
      parsedInput,
      ctx,
    }): Promise<
      ActionResponse<{ uploadUrl: string; storageKey: string; expiresInSeconds: number }>
    > => {
      const rl = await rateLimitWrites(`upload:${ctx.userId}`)
      if (!rl.ok) return failure(rl.message)

      try {
        const out = await createPresignedPut({
          userId: ctx.userId,
          contentType: parsedInput.contentType,
          byteSize: parsedInput.byteSize,
        })
        return success(out)
      } catch (e) {
        return failure(e instanceof Error ? e.message : "Could not start upload.")
      }
    },
  )

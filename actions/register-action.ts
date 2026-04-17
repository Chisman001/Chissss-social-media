"use server"

import bcrypt from "bcryptjs"
import { z } from "zod"

import { normalizeEmail } from "@/lib/normalize-email"
import { prisma } from "@/lib/prisma"
import { rateLimitRegister } from "@/lib/ratelimit"
import { getRateLimitIpKey } from "@/lib/request-ip"
import { actionClient } from "@/lib/safe-action"
import { failure, success, type ActionResponse } from "@/types/actions"

const registerSchema = z.object({
  email: z.string().email().transform((e) => normalizeEmail(e)),
  password: z.string().min(8).max(128),
  handle: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/i, "Use letters, numbers, or underscores."),
  displayName: z.string().min(1).max(80),
})

export const registerUser = actionClient
  .schema(registerSchema)
  .action(async ({ parsedInput }): Promise<ActionResponse<{ ok: true }>> => {
    const regRl = await rateLimitRegister(`reg:${await getRateLimitIpKey()}`)
    if (!regRl.ok) return failure(regRl.message)

    const taken = await prisma.user.findFirst({
      where: { OR: [{ email: parsedInput.email }, { handle: parsedInput.handle.toLowerCase() }] },
      select: { id: true },
    })
    if (taken) return failure("That email or handle is already taken.")

    const passwordHash = await bcrypt.hash(parsedInput.password, 12)
    await prisma.user.create({
      data: {
        email: parsedInput.email,
        passwordHash,
        handle: parsedInput.handle.toLowerCase(),
        displayName: parsedInput.displayName,
      },
    })
    return success({ ok: true })
  })

import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { nanoid } from "nanoid"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"

import { authConfig } from "@/auth.config"
import { normalizeEmail } from "@/lib/normalize-email"
import { prisma } from "@/lib/prisma"

const credentials = Credentials({
  name: "Email",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  authorize: async (credentials) => {
    const parsed = z
      .object({
        email: z.string().email().transform((e) => normalizeEmail(e)),
        password: z.string().min(8),
      })
      .safeParse(credentials)
    if (!parsed.success) return null
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    })
    if (!user?.passwordHash) return null
    const valid = await bcrypt.compare(parsed.data.password, user.passwordHash)
    if (!valid) return null
    return user
  },
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [...authConfig.providers, credentials],
  events: {
    async createUser({ user }) {
      if (!user.id) return
      const emailPart = user.email?.split("@")[0]?.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20)
      const base = emailPart && emailPart.length > 0 ? emailPart : "user"
      for (let attempt = 0; attempt < 8; attempt++) {
        const handle = `${base}_${nanoid(5)}`
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              handle,
              displayName: user.name ?? handle,
            },
          })
          return
        } catch {
          /* unique collision */
        }
      }
    },
  },
})

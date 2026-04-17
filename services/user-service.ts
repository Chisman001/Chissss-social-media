import { prisma } from "@/lib/prisma"

export async function getUserByHandle(handle: string) {
  const user = await prisma.user.findUnique({
    where: { handle },
    select: {
      id: true,
      handle: true,
      displayName: true,
      bio: true,
      image: true,
      avatarStorageKey: true,
      _count: { select: { followsReceived: true, followsInitiated: true } },
    },
  })
  if (!user) throw new Error("User not found.")
  return user
}

export async function getUserIdByHandle(handle: string) {
  const user = await prisma.user.findUnique({
    where: { handle },
    select: { id: true },
  })
  if (!user) throw new Error("User not found.")
  return user.id
}

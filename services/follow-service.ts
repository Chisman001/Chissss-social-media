import { NotificationType, Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"

/** Creates follow + FOLLOW notification in one transaction (no partial follow without notification). */
export async function followUserWithNotification(followerId: string, followeeHandle: string) {
  return prisma.$transaction(async (tx) => {
    const followee = await tx.user.findUnique({
      where: { handle: followeeHandle },
      select: { id: true },
    })
    if (!followee) throw new Error("User not found.")
    if (followee.id === followerId) throw new Error("You cannot follow yourself.")

    try {
      await tx.follow.create({
        data: { followerId, followeeId: followee.id },
      })
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new Error("You already follow this user.")
      }
      throw e
    }

    await tx.notification.create({
      data: {
        recipientId: followee.id,
        actorId: followerId,
        type: NotificationType.FOLLOW,
      },
    })
  })
}

export async function followUser(followerId: string, followeeHandle: string) {
  const followee = await prisma.user.findUnique({
    where: { handle: followeeHandle },
    select: { id: true },
  })
  if (!followee) throw new Error("User not found.")
  if (followee.id === followerId) throw new Error("You cannot follow yourself.")

  try {
    await prisma.follow.create({
      data: { followerId, followeeId: followee.id },
    })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      throw new Error("You already follow this user.")
    }
    throw e
  }
}

export async function unfollowUser(followerId: string, followeeHandle: string) {
  const followee = await prisma.user.findUnique({
    where: { handle: followeeHandle },
    select: { id: true },
  })
  if (!followee) throw new Error("User not found.")

  await prisma.follow.deleteMany({
    where: { followerId, followeeId: followee.id },
  })
}

export async function isFollowing(followerId: string, followeeHandle: string) {
  const followee = await prisma.user.findUnique({
    where: { handle: followeeHandle },
    select: { id: true },
  })
  if (!followee) return false
  const row = await prisma.follow.findUnique({
    where: {
      followerId_followeeId: { followerId, followeeId: followee.id },
    },
  })
  return Boolean(row)
}

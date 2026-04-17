import { NotificationType } from "@prisma/client"

import { prisma } from "@/lib/prisma"

export async function listNotifications(userId: string, take = 40) {
  return prisma.notification.findMany({
    where: { recipientId: userId },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      type: true,
      readAt: true,
      createdAt: true,
      postId: true,
      commentId: true,
      actor: { select: { handle: true, displayName: true, image: true } },
    },
  })
}

export async function countUnreadNotifications(userId: string) {
  return prisma.notification.count({
    where: { recipientId: userId, readAt: null },
  })
}

export async function markNotificationRead(userId: string, notificationId: string) {
  const res = await prisma.notification.updateMany({
    where: { id: notificationId, recipientId: userId },
    data: { readAt: new Date() },
  })
  if (res.count === 0) throw new Error("Notification not found.")
}

export async function markAllNotificationsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { recipientId: userId, readAt: null },
    data: { readAt: new Date() },
  })
}

export async function notifyFollow(recipientId: string, actorId: string) {
  if (recipientId === actorId) return
  await prisma.notification.create({
    data: {
      recipientId,
      actorId,
      type: NotificationType.FOLLOW,
    },
  })
}

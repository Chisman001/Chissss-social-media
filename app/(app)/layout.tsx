import { redirect } from "next/navigation"

import { AppNav } from "@/components/app-shell/app-nav"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { countUnreadNotifications } from "@/services/notification-service"

export default async function AppGroupLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/sign-in")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      handle: true,
      displayName: true,
      image: true,
      avatarStorageKey: true,
    },
  })
  if (!user) redirect("/sign-in")

  const unreadCount = await countUnreadNotifications(user.id)

  return (
    <div className="min-h-dvh">
      <AppNav user={user} unreadCount={unreadCount} />
      <div className="mx-auto max-w-2xl px-4 py-6 md:max-w-3xl">{children}</div>
    </div>
  )
}

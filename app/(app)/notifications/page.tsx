import Link from "next/link"

import { auth } from "@/auth"
import { MarkNotificationsClient } from "@/components/notifications-page/mark-notifications-client"
import { listNotifications } from "@/services/notification-service"

export default async function NotificationsPage() {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return null

  const items = await listNotifications(userId)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
        <MarkNotificationsClient />
      </div>
      <ul className="space-y-3">
        {items.length === 0 ? (
          <li className="text-muted-foreground">You are all caught up.</li>
        ) : (
          items.map((n) => (
            <li
              key={n.id}
              className={`rounded-lg border p-4 ${n.readAt ? "opacity-70" : "border-primary/40 bg-muted/30"}`}
            >
              <div className="flex flex-wrap items-baseline gap-2 text-sm">
                <span className="font-medium">{n.actor.displayName ?? `@${n.actor.handle}`}</span>
                <span className="text-muted-foreground">
                  {n.type === "LIKE" && "liked your post"}
                  {n.type === "COMMENT" && "commented on your post"}
                  {n.type === "FOLLOW" && "started following you"}
                </span>
                <span className="text-muted-foreground">· {new Date(n.createdAt).toLocaleString()}</span>
              </div>
              {n.postId ? (
                <Link href={`/post/${n.postId}`} className="mt-2 inline-block text-sm text-primary hover:underline">
                  View post
                </Link>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </div>
  )
}

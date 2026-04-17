import Link from "next/link"

import { Bell } from "lucide-react"

import { Button } from "@/components/ui/button"

interface NotificationBellProps {
  unreadCount: number
}

export function NotificationBell({ unreadCount }: NotificationBellProps) {
  const label = unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"

  return (
    <Button variant="ghost" size="icon" className="relative h-11 w-11 shrink-0" asChild>
      <Link href="/notifications" aria-label={label}>
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </Link>
    </Button>
  )
}

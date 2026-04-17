"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"

import { NotificationBell } from "@/components/notification-bell/notification-bell"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserAvatar } from "@/components/user-avatar/user-avatar"
import { cn } from "@/lib/utils"

interface AppNavProps {
  user: {
    id: string
    handle: string
    displayName: string | null
    image: string | null
    avatarStorageKey: string | null
  }
  unreadCount: number
}

export function AppNav({ user, unreadCount }: AppNavProps) {
  const pathname = usePathname()
  const label = user.displayName ?? user.handle
  const profileHref = `/u/${user.handle}`

  const mainLinks = [
    { href: "/feed", label: "Feed", isActive: pathname === "/feed" },
    {
      href: "/discover",
      label: "Discover",
      isActive: pathname === "/discover" || pathname.startsWith("/discover/"),
    },
    { href: profileHref, label: "Profile", isActive: pathname === profileHref },
    {
      href: "/notifications",
      label: "Alerts",
      isActive: pathname === "/notifications" || pathname.startsWith("/notifications/"),
      linkClassName: "sm:hidden",
    },
    {
      href: "/settings",
      label: "Settings",
      isActive: pathname === "/settings" || pathname.startsWith("/settings/"),
    },
  ] as const

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3 md:max-w-3xl">
        <nav className="flex flex-wrap items-center gap-2 sm:gap-4" aria-label="Main">
          {mainLinks.map(({ href, label: linkLabel, isActive, linkClassName }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "min-h-11 min-w-11 content-center",
                isActive
                  ? "text-base font-semibold text-foreground"
                  : "text-sm text-muted-foreground hover:text-foreground",
                linkClassName,
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {linkLabel}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <NotificationBell unreadCount={unreadCount} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full" aria-label="Account menu">
                <UserAvatar
                  image={user.image}
                  avatarStorageKey={user.avatarStorageKey}
                  label={label}
                  className="h-9 w-9"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-44">
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault()
                  void signOut({ callbackUrl: "/" })
                }}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

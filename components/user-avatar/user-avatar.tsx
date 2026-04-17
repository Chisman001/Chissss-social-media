import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { publicMediaUrl } from "@/lib/media-url"

interface UserAvatarProps {
  image?: string | null
  avatarStorageKey?: string | null
  label: string
  className?: string
}

export function UserAvatar({ image, avatarStorageKey, label, className }: UserAvatarProps) {
  const fromStorage = publicMediaUrl(avatarStorageKey ?? undefined)
  const src = fromStorage ?? image ?? undefined
  const initials = label
    .split(/\s+/g)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <Avatar className={className}>
      {src ? <AvatarImage src={src} alt="" /> : null}
      <AvatarFallback>{initials || "?"}</AvatarFallback>
    </Avatar>
  )
}

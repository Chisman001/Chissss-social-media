"use client"

import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"

import { markAllRead } from "@/actions/notification-actions"
import { Button } from "@/components/ui/button"

export function MarkNotificationsClient() {
  const router = useRouter()
  const { execute, isExecuting } = useAction(markAllRead, {
    onSuccess({ data }) {
      if (data?.ok) router.refresh()
    },
  })

  return (
    <Button type="button" variant="outline" className="min-h-11 w-full sm:w-auto" disabled={isExecuting} onClick={() => execute({})}>
      {isExecuting ? "Updating…" : "Mark all read"}
    </Button>
  )
}

"use client"

import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import { useAction } from "next-safe-action/hooks"

import { updateProfile } from "@/actions/profile-actions"
import { getPresignedUpload } from "@/actions/upload-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface SettingsFormProps {
  initialDisplayName: string
  initialBio: string
  uploadEnabled: boolean
}

export function SettingsForm({ initialDisplayName, initialBio, uploadEnabled }: SettingsFormProps) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const { executeAsync: updateAsync, isExecuting: saving } = useAction(updateProfile, {
    onSuccess({ data }) {
      if (data?.ok) {
        setMessage(null)
        setSaved(true)
        router.refresh()
      } else if (data && !data.ok) {
        setSaved(false)
        setMessage(data.error)
      }
    },
    onError({ error }) {
      setMessage(error.serverError ?? "Could not save.")
    },
  })

  const { executeAsync: presignAsync, isExecuting: presigning } = useAction(getPresignedUpload)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage(null)
    setSaved(false)
    const fd = new FormData(e.currentTarget)
    const displayName = String(fd.get("displayName") ?? "").trim()
    const bio = String(fd.get("bio") ?? "").trim()
    const file = fileRef.current?.files?.[0]

    if (file && uploadEnabled) {
      const presignRes = await presignAsync({ contentType: file.type, byteSize: file.size })
      const pd = presignRes?.data
      if (!pd?.ok) {
        setMessage(pd && !pd.ok ? pd.error : "Could not start avatar upload.")
        return
      }
      const put = await fetch(pd.data.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      })
      if (!put.ok) {
        setMessage("Avatar upload failed.")
        return
      }
      await updateAsync({
        displayName: displayName || undefined,
        bio: bio || undefined,
        avatarStorageKey: pd.data.storageKey,
      })
      if (fileRef.current) fileRef.current.value = ""
      return
    }

    await updateAsync({
      displayName: displayName || undefined,
      bio: bio || undefined,
    })
  }

  const busy = saving || presigning

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-4 rounded-lg border p-4">
      <div className="space-y-2">
        <label htmlFor="displayName" className="text-sm font-medium">
          Display name
        </label>
        <Input id="displayName" name="displayName" defaultValue={initialDisplayName} maxLength={80} />
      </div>
      <div className="space-y-2">
        <label htmlFor="bio" className="text-sm font-medium">
          Bio
        </label>
        <Textarea id="bio" name="bio" defaultValue={initialBio} maxLength={500} rows={4} />
      </div>
      {uploadEnabled ? (
        <div className="space-y-2">
          <label htmlFor="avatar" className="text-sm font-medium">
            Avatar image
          </label>
          <input
            id="avatar"
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="min-h-11 w-full text-sm"
          />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Avatar upload needs S3 configuration.</p>
      )}
      {saved ? <p className="text-sm text-muted-foreground">Profile saved.</p> : null}
      {message ? <p className="text-sm text-destructive">{message}</p> : null}
      <Button type="submit" className="min-h-11" disabled={busy}>
        {busy ? "Saving…" : "Save profile"}
      </Button>
    </form>
  )
}

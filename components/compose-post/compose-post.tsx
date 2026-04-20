"use client"

import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import { useAction } from "next-safe-action/hooks"

import { ImageIcon, SmileIcon } from "lucide-react"

import { createPost } from "@/actions/post-actions"
import { getPresignedUpload } from "@/actions/upload-actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface ComposePostProps {
  uploadEnabled: boolean
}

export function ComposePost({ uploadEnabled }: ComposePostProps) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const { executeAsync: createAsync, isExecuting: creating } = useAction(createPost, {
    onSuccess({ data }) {
      if (data?.ok) {
        setMessage(null)
        if (fileRef.current) fileRef.current.value = ""
        setFile(null)
        router.refresh()
      } else if (data && !data.ok) setMessage(data.error)
    },
    onError({ error }) {
      setMessage(error.serverError ?? "Could not post.")
    },
  })

  const { executeAsync: presignAsync, isExecuting: presigning } = useAction(getPresignedUpload)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage(null)
    const form = e.currentTarget
    const body = (form.elements.namedItem("body") as HTMLTextAreaElement).value.trim()
    if (!body) {
      setMessage("Write something first.")
      return
    }

    if (file && uploadEnabled) {
      const presignRes = await presignAsync({ contentType: file.type, byteSize: file.size })
      const pd = presignRes?.data
      if (!pd) {
        setMessage(presignRes?.serverError?.toString() ?? "Upload failed.")
        return
      }
      if (!pd.ok) {
        setMessage(pd.error)
        return
      }

      const put = await fetch(pd.data.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      })
      if (!put.ok) {
        setMessage("Could not upload the image.")
        return
      }

      await createAsync({
        body,
        media: [{ storageKey: pd.data.storageKey, mime: file.type, byteSize: file.size }],
      })
      return
    }

    await createAsync({ body })
  }

  const busy = creating || presigning

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-lg border p-4">
      <Textarea name="body" placeholder="What is happening?" maxLength={2000} rows={4} className="resize-y" />
      {uploadEnabled ? (
        <div className="flex items-center gap-1">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(ev) => setFile(ev.target.files?.[0] ?? null)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Add image"
            onClick={() => fileRef.current?.click()}
            className="text-brand-purple hover:text-brand-pink hover:bg-brand-purple/10"
          >
            <ImageIcon className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Add GIF"
            className="text-brand-purple hover:text-brand-pink hover:bg-brand-purple/10"
          >
            <span className="text-xs font-bold tracking-tight border border-current rounded px-1 leading-5">GIF</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Add emoji"
            className="text-brand-purple hover:text-brand-pink hover:bg-brand-purple/10"
          >
            <SmileIcon className="h-5 w-5" />
          </Button>
          {file && <span className="ml-2 text-xs text-muted-foreground truncate max-w-[160px]">{file.name}</span>}
        </div>
      ) : null}
      {message ? <p className="text-sm text-destructive">{message}</p> : null}
      <Button type="submit" className="min-h-11 w-full sm:w-auto bg-gradient-to-r from-brand-purple via-brand-pink to-brand-lime text-white hover:opacity-90" disabled={busy}>
        {busy ? "Posting…" : "Post"}
      </Button>
    </form>
  )
}

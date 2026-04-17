import { auth } from "@/auth"
import { SettingsForm } from "@/components/settings-form/settings-form"
import { isUploadConfigured } from "@/lib/storage/presign"
import { prisma } from "@/lib/prisma"

export default async function SettingsPage() {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return null

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { displayName: true, bio: true, handle: true },
  })
  if (!user) return null

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="text-sm text-muted-foreground">
        Signed in as <span className="font-medium text-foreground">@{user.handle}</span>
      </p>
      <SettingsForm
        initialDisplayName={user.displayName ?? ""}
        initialBio={user.bio ?? ""}
        uploadEnabled={isUploadConfigured()}
      />
    </div>
  )
}

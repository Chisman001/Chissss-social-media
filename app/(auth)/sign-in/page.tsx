import { Suspense } from "react"

import { SignInForm } from "@/components/sign-in-form/sign-in-form"

function SignInFallback() {
  return <p className="text-center text-muted-foreground">Loading…</p>
}

export default function SignInPage() {
  const hasGithub = Boolean(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET)

  return (
    <Suspense fallback={<SignInFallback />}>
      <SignInForm hasGithub={hasGithub} />
    </Suspense>
  )
}

"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { useEffect, useState } from "react"
import { useAction } from "next-safe-action/hooks"

import { registerUser } from "@/actions/register-action"
import { Button } from "@/components/ui/button"
import { getSafeCallbackUrl } from "@/lib/safe-callback-url"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SignInFormProps {
  hasGithub: boolean
}

const SUCCESS_DISMISS_MS = 5000

export function SignInForm({ hasGithub }: SignInFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isRegister = searchParams.get("register") === "1"
  const callbackUrl = getSafeCallbackUrl(searchParams.get("callbackUrl"))

  const [message, setMessage] = useState<FormBanner | null>(null)

  useEffect(() => {
    if (message?.tone !== "success") return
    const id = window.setTimeout(() => setMessage(null), SUCCESS_DISMISS_MS)
    return () => window.clearTimeout(id)
  }, [message])

  const { execute: execRegister, isExecuting: registering } = useAction(registerUser, {
    onSuccess({ data }) {
      if (data?.ok) {
        setMessage({ text: "Account created. Sign in below.", tone: "success" })
        router.replace("/sign-in")
      } else if (data && !data.ok) setMessage({ text: data.error, tone: "error" })
    },
    onError({ error }) {
      setMessage({ text: error.serverError ?? "Registration failed.", tone: "error" })
    },
  })

  async function onCredentials(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage(null)
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get("email") ?? "")
    const password = String(fd.get("password") ?? "")
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    })
    if (res?.error) {
      setMessage({ text: "Invalid email or password.", tone: "error" })
      return
    }
    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <Card className="border-white/10 bg-white/5 text-white backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white">{isRegister ? "Create account" : "Sign in"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasGithub ? (
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-full border-white/20 bg-white/10 text-white hover:bg-white/20"
              onClick={() => void signIn("github", { callbackUrl })}
            >
              Continue with GitHub
            </Button>
          ) : null}
          {isRegister ? (
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault()
                const fd = new FormData(e.currentTarget)
                execRegister({
                  email: String(fd.get("email")),
                  password: String(fd.get("password")),
                  handle: String(fd.get("handle")),
                  displayName: String(fd.get("displayName")),
                })
              }}
            >
              <Input name="displayName" type="text" required placeholder="Display name" autoComplete="name" className="text-foreground" />
              <Input name="handle" type="text" required placeholder="Handle (letters, numbers, _)" autoComplete="username" className="text-foreground" />
              <Input name="email" type="email" required placeholder="Email" autoComplete="email" className="text-foreground" />
              <Input name="password" type="password" required placeholder="Password (8+ chars)" autoComplete="new-password" className="text-foreground" />
              {message ? <FormMessage banner={message} /> : null}
              <Button
                type="submit"
                className="min-h-11 w-full bg-gradient-to-r from-brand-purple via-brand-pink to-brand-lime text-white hover:opacity-90"
                disabled={registering}
              >
                {registering ? "Creating…" : "Register"}
              </Button>
            </form>
          ) : (
            <form className="space-y-3" onSubmit={onCredentials}>
              <Input name="email" type="email" required placeholder="Email" autoComplete="email" className="text-foreground" />
              <Input name="password" type="password" required placeholder="Password" autoComplete="current-password" className="text-foreground" />
              {message ? <FormMessage banner={message} /> : null}
              <Button
                type="submit"
                className="min-h-11 w-full bg-gradient-to-r from-brand-purple via-brand-pink to-brand-lime text-white hover:opacity-90"
              >
                Sign in with email
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
      <p className="text-center text-sm text-white/60">
        {isRegister ? (
          <a href="/sign-in" className="underline">
            Have an account? Sign in
          </a>
        ) : (
          <a href="/sign-in?register=1" className="underline">
            Need an account? Register
          </a>
        )}
      </p>
    </div>
  )
}

function FormMessage({ banner }: { banner: FormBanner }) {
  const toneClass =
    banner.tone === "success" ? "text-green-600 dark:text-green-500" : "text-destructive"
  return <p className={`text-sm ${toneClass}`}>{banner.text}</p>
}

interface FormBanner {
  text: string
  tone: "success" | "error"
}

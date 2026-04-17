import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { auth } from "@/auth"

export default async function HomePage() {
  const session = await auth()

  return (
    <main className="flex w-full max-w-lg flex-col items-center gap-8 py-16 text-center md:max-w-2xl md:py-24">
      <div className="flex flex-col items-center gap-4">
        <Image
          src="/logo-mark.png"
          alt="Chissss"
          width={120}
          height={120}
          className="object-contain"
          priority
        />
        <p className="text-balance text-white/70 md:text-lg">
          Share short posts, follow people, and keep up in one place.
        </p>
      </div>
      <div className="flex w-full max-w-xs flex-col gap-3 sm:flex-row sm:justify-center">
        {session?.user ? (
          <Button asChild className="min-h-11 min-w-44 bg-gradient-to-r from-brand-purple via-brand-pink to-brand-lime text-white hover:opacity-90">
            <Link href="/feed">Open feed</Link>
          </Button>
        ) : (
          <>
            <Button asChild className="min-h-11 min-w-44 bg-gradient-to-r from-brand-purple via-brand-pink to-brand-lime text-white hover:opacity-90">
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild variant="outline" className="min-h-11 min-w-44 border-white/30 bg-transparent text-white hover:bg-white/10">
              <Link href="/sign-in?register=1">Create account</Link>
            </Button>
          </>
        )}
      </div>
    </main>
  )
}

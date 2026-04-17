import Image from "next/image"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-brand-black px-4 py-10">
      {/* Blurred logo glow layer */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-10 blur-3xl"
        aria-hidden="true"
      >
        <Image src="/logo.png" alt="" width={600} height={600} className="object-contain" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <Image src="/logo-mark.png" alt="Chissss" width={80} height={80} className="object-contain" priority />
        </div>
        {children}
      </div>
    </div>
  )
}

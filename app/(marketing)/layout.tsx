export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-brand-black px-4 text-white">
      {children}
    </div>
  )
}

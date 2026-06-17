export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-an-bg-base overflow-hidden">
      {children}
    </div>
  )
}

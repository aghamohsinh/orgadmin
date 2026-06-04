import { Outlet } from 'react-router-dom'
import { Building2 } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[--color-muted] px-4">
      <div className="mb-8 flex items-center gap-2 text-xl font-bold text-[--color-foreground]">
        <Building2 className="h-6 w-6 text-[--color-primary]" />
        OrgAdmin
      </div>
      <Outlet />
    </div>
  )
}

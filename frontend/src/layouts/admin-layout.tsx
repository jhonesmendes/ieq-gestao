import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/shared/sidebar'

/** Layout completo com sidebar — admin/pastor/supervisor. */
export function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}

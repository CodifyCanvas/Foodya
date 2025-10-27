'use client'

import useSWR from 'swr'
import { Loader } from 'lucide-react'

import { DataTable } from '@/components/DataTable/data-table'
import { columns } from './columns'
import { useModulePermission } from '@/hooks/useModulePermission'
import { useUserContext } from '@/hooks/context/useUserContext'
import AccessDenied from '@/app/errors/403/page'
import ServiceUnavailable from '@/app/errors/service-unavailable'
import { Role } from '@/lib/definations'
import { swrFetcher } from '@/lib/swr'



const PermissionsPage = () => {
  // === Module Permission Hook ===
  const { canView, loading: permLoading } = useModulePermission()

  // === User Context (for refetching permissions after edits) ===
  const { refetchPermissions } = useUserContext()

  // === Fetch permissions data via SWR ===
  const { data: permissions, error, isLoading: dataLoading } = useSWR<Role[]>(
    '/api/permission',
    swrFetcher
  )

  // === Combined loading state ===
  const isLoading = permLoading || dataLoading

  // === Loading Fallback ===
  if (isLoading) {
    return (
      <div className="flex-1 h-full w-full bg-white flex justify-center items-center">
        <Loader className="animate-spin size-7 text-gray-500" />
      </div>
    )
  }

  // === Access Denied Fallback ===
  if (!canView) {
    return <AccessDenied />
  }

  // === Error Fallback ===
  if (error) {
    console.error('SWR Error:', error)
    return (
      <ServiceUnavailable
        title="Service Unavailable"
        description="Please try again later or check your connection."
      />
    )
  }

  return (
    <div className="bg-white rounded-lg min-h-[50vh] flex flex-col">

      {/* === Page Header === */}
      <header className="px-4 pt-3">
        <h3 className="text-3xl font-medium text-emerald-600 text-start">
          Permissions
        </h3>
      </header>

      {/* === Permissions Data Table === */}
      <DataTable
        columns={columns({ refetchPermissions })}
        data={permissions ?? []}
        filterColumns={['role']}
        loading={isLoading}
      />
    </div>
  )
}

export default PermissionsPage
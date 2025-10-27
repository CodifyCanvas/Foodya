'use client'

import useSWR from 'swr'
import { Loader } from 'lucide-react'

import { DataTable } from '@/components/DataTable/data-table'
import { columns } from './columns'
import { CreateForm } from './table-actions'
import { useModulePermission } from '@/hooks/useModulePermission'
import AccessDenied from '@/app/errors/403/page'
import ServiceUnavailable from '@/app/errors/service-unavailable'
import { ModuleInterface } from '@/lib/definations'
import { swrFetcher } from '@/lib/swr'



const ModulesPage = () => {
  // === Module Permission Hook ===
  const { canView, loading: permLoading } = useModulePermission()

  // === Fetch modules data ===
  const { data: modules, error, isLoading: dataLoading } = useSWR<ModuleInterface[]>(
    '/api/module',
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
          Modules
        </h3>
      </header>

      {/* === Modules Data Table === */}
      <DataTable
        columns={columns()}
        data={modules ?? []}
        filterColumns={['name']}
        createComponent={<CreateForm />}
        loading={isLoading}
      />
    </div>
  )
}

export default ModulesPage
'use client'

import useSWR from 'swr'
import { Loader } from 'lucide-react'

import { DataTable } from '@/components/DataTable/data-table'
import { columns } from './columns'
import { CreateForm } from './table-actions'
import { useModulePermission } from '@/hooks/useModulePermission'
import AccessDenied from '@/app/errors/access-control-view/access-denied'
import { EmployeeWithLatestRecord } from '@/lib/definations'

/* === Data Fetcher Function === */
const fetcher = (url: string) => fetch(url).then(res => res.json())

/* === Employees Module Page === */
const Page = () => {

  // === Module Permission Hook ===
  const { canView, loading: permLoading } = useModulePermission()

  // === Fetch Employee Data ===
  const { data, error, isLoading: dataLoading, } = useSWR<EmployeeWithLatestRecord[]>('/api/employees/all', fetcher)

  // === Combined Loading State ===
  const isLoading = permLoading || dataLoading

  // === Loading UI ===
  if (isLoading) {
    return (
      <div className="flex-1 h-full w-full bg-white flex justify-center items-center">
        <Loader className="animate-spin size-7 text-gray-500" />
      </div>
    )
  }

  // === Access Denied View ===
  if (!canView) {
    return <AccessDenied />
  }

  return (
    <div className="bg-white rounded-lg min-h-[50vh] flex flex-col">
      {/* === Page Header === */}
      <h3 className="text-3xl font-medium text-start px-4 pt-3 text-emerald-600">
        Employees Management
      </h3>

      {/* === Data Table or Error Message === */}
      {error ? (
        <div className="text-center text-destructive py-4 font-medium">
          Failed to load data
        </div>
      ) : (
        <DataTable
          columns={columns()}
          data={data ?? []}
          filterColumns={[]}
          createComponent={<CreateForm />}
        />
      )}
    </div>
  )
}

export default Page

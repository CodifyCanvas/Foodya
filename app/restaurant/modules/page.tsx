"use client"

import { DataTable } from '@/components/DataTable/data-table'
import { columns, Module } from './columns'
import { CreateForm } from './table-actions'
import useSWR from 'swr'
import { Loader } from 'lucide-react'

/* === Data Fetcher === */
const fetcher = (url: string) => fetch(url).then(res => res.json())

const RolesPage = () => {
  /* === Fetch Roles from API === */
  const { data, error, isLoading } = useSWR<Module[]>("/api/module", fetcher)

  return (
    <div className="bg-white rounded-lg min-h-[50vh] flex flex-col">

      {/* === Page Header === */}
      <h3 className="text-3xl font-medium text-start px-4 pt-3 text-emerald-600">
        Modules
      </h3>

      {/* === Loading State === */}
      {isLoading ? (
        <div className="flex-1 flex justify-center items-center">
          <Loader className="animate-spin size-7 text-gray-500" />
        </div>

      /* === Error State === */
      ) : error ? (
        <div className="text-center text-destructive py-4 font-medium">Failed to load data</div>

      /* === DataTable Display === */
      ) : (
        <DataTable
          columns={columns()}
          data={data ?? []}
          filterColumns={["name"]}
          createComponent={<CreateForm />}
        />
      )}
    </div>
  )
}

export default RolesPage

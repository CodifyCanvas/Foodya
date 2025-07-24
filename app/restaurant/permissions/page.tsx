"use client"

import useSWR from 'swr'
import { Loader } from 'lucide-react'

import { DataTable } from '@/components/DataTable/data-table'
import { columns, UsersWithRolesResponse } from './columns'
import { CreateForm } from './table-actions'

/* === SWR Fetcher === */
const fetcher = (url: string) => fetch(url).then(res => res.json())

/* === Users Page Component === */
const RolesPage = () => {
  const { data, error, isLoading } = useSWR<UsersWithRolesResponse>("/api/users", fetcher)

  return (
    <div className="bg-white rounded-lg min-h-[50vh] flex flex-col">
      
      {/* === Page Header === */}
      <h3 className="text-3xl font-medium text-start px-4 pt-3 text-emerald-600">Users</h3>

      {/* === Loading State === */}
      {isLoading ? (
        <div className="flex-1 flex justify-center items-center">
          <Loader className="animate-spin size-7 text-gray-500" />
        </div>

      ) : error ? (
        /* === Error State === */
        <div className="text-center py-4 text-red-500">Failed to load data</div>

      ) : (
        /* === Data Table === */
        <DataTable
          columns={columns({ roles: data?.roles ?? [] })}
          data={data?.users ?? []}
          filterColumns={["email", "name"]}
          createComponent={
            <CreateForm props={{ roles: data?.roles ?? [] }} />
          }
        />
      )}
    </div>
  )
}

export default RolesPage

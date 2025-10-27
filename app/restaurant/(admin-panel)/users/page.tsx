'use client'

import useSWR from 'swr'
import { Loader } from 'lucide-react'

import { DataTable } from '@/components/DataTable/data-table'
import { columns, UsersWithRolesResponse } from './columns'
import { CreateForm } from './table-actions'
import { useModulePermission } from '@/hooks/useModulePermission'
import AccessDenied from '@/app/errors/403/page'
import ServiceUnavailable from '@/app/errors/service-unavailable'
import { swrFetcher } from '@/lib/swr'



const UsersPage = () => {

  // === Permission check for this module ===
  const { canView, loading: permLoading } = useModulePermission()

  // === Fetch users data using SWR ===
  const { data, error, isLoading: dataLoading } = useSWR<UsersWithRolesResponse>(
    '/api/users',
    swrFetcher
  )

  // === Overall loading state ===
  const isLoading = permLoading || dataLoading

  // === Loading fallback ===
  if (isLoading) {
    return (
      <div className="flex-1 h-full w-full bg-white flex justify-center items-center">
        <Loader className="animate-spin size-7 text-gray-500" />
      </div>
    )
  }

  // === Access denied fallback ===
  if (!canView) {
    return <AccessDenied />
  }

  // === Error fallback ===
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
          Users
        </h3>
      </header>

      {/* === Users Data Table === */}
      <DataTable
        columns={columns({ roles: data?.roles ?? [] })}
        data={data?.users ?? []}
        filterColumns={['email', 'name']}
        createComponent={<CreateForm props={{ roles: data?.roles ?? [] }} />}
        loading={isLoading}
      />
    </div>
  )
}

export default UsersPage
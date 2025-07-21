import { DataTable } from '@/components/DataTable/data-table'
import { columns, Role } from './columns'
import { CreateForm } from './table-actions'

export async function getData(): Promise<Role[]> {
  return [
    { id: 1, role: 'Admin' },
    { id: 2, role: 'Operator' },
    { id: 3, role: 'Chef' },
    { id: 4, role: 'Manager' },
    { id: 5, role: 'Cashier' },
    { id: 6, role: 'Receptionist' },
    { id: 7, role: 'Supervisor' },
    { id: 8, role: 'Cleaner' },
    { id: 9, role: 'Cook' },
    { id: 10, role: 'Waiter' },
    { id: 11, role: 'Accountant' },
    { id: 12, role: 'Security' },
    { id: 13, role: 'Delivery' },
    { id: 14, role: 'Assistant Manager' },
    { id: 15, role: 'Trainer' },
    { id: 16, role: 'Storekeeper' },
    { id: 17, role: 'Marketing Executive' },
    { id: 18, role: 'IT Support' },
    { id: 19, role: 'Host' },
    { id: 20, role: 'Barista' },
    { id: 21, role: 'Dishwasher' },
    { id: 22, role: 'Inventory Clerk' },
    { id: 23, role: 'Quality Analyst' },
    { id: 24, role: 'Maintenance' },
    { id: 25, role: 'Photographer' },
    { id: 26, role: 'Designer' },
    { id: 27, role: 'Customer Support' },
    { id: 28, role: 'HR Executive' },
    { id: 29, role: 'Procurement Officer' },
    { id: 30, role: 'Content Writer' },
  ]
}


const RolesPage = async () => {
  const data = await getData()

  return (
    <div className="bg-white rounded-lg">
      <h3 className='text-3xl font-medium text-start px-4 pt-3 text-emerald-600'>Roles</h3>
      <DataTable columns={columns} data={data} filterColumns={["role"]} createComponent={CreateForm} />
    </div>
  )
}

export default RolesPage

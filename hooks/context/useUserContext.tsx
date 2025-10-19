'use client';

import React, { createContext, useContext, useCallback, useEffect, useState, useMemo, ReactNode } from 'react';
import useSWR from 'swr';
import { User, Permissions, ModulePermission } from '@/lib/definations';
import toast from 'react-hot-toast';



interface PermissionMap {
  [moduleName: string]: ModulePermission;
}



interface UserContextType {
  user: User | null;
  permissions: Permissions[] | null;
  permission: PermissionMap;
  loading: boolean;
  error: Error | null;
  refetchUser: () => void;
  refetchPermissions: () => Promise<void>;
  reset: () => void;
}



interface UserProviderProps {
  children: ReactNode;
}



// === Fetch function for SWR ===
const fetchUser = (url: string) => fetch(url).then((res) => res.json());



// === Context ===
const UserContext = createContext<UserContextType | undefined>(undefined);



// === UserProvider Component===
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {

  // Fetch user data using SWR
  const { data: user, error, isLoading, mutate } = useSWR<User>('/api/user', fetchUser);

  // Local state to manage permissions and related errors/loading
  const [permissions, setPermissions] = useState<Permissions[] | null>(null);
  const [permError, setPermError] = useState<Error | null>(null);
  const [permissionsLoading, setPermissionsLoading] = useState<boolean>(false);


  // === Fetch permissions for a given role_id ===
  const fetchPermissions = useCallback(async (role_id: string) => {
    setPermissionsLoading(true);

    try {
      toast.loading("Fetching permissions, please wait...", {
        id: 'permission-toast'
      })

      const res = await fetch('/api/permission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: Number(role_id) }),
      });

      if (!res.ok) throw new Error('Failed to fetch permissions');

      const data = await res.json();
      setPermissions(data);
      setPermError(null);
    } catch (err) {

      setPermissions(null);
      setPermError(err as Error);
    } finally {

      setPermissionsLoading(false);
      toast.dismiss('permission-toast')
    }
  }, []);


  // Refetch permissions when user.role_id changes
  useEffect(() => {
    if (user?.role_id) {
      fetchPermissions(user.role_id);
    }
  }, [user?.role_id, fetchPermissions]);


  // Function to refetch permissions manually
  const refetchPermissions = useCallback(async () => {
    if (user?.role_id) {
      await fetchPermissions(user.role_id);
    }
  }, [user?.role_id, fetchPermissions]);


  // Function to refetch user data manually
  const refetchUser = useCallback(() => {
    mutate();
  }, [mutate]);


  // Reset user and permissions state
  const reset = useCallback(() => {
    mutate(null as unknown as User, false);
    setPermissions(null);
    setPermError(null);
  }, [mutate]);


  /**
   * Memoized permission map for quick access:
   * e.g. permission['module_name'].can_view
   */
  const permission = useMemo(() => {
    if (!permissions) return {};

    return permissions.reduce((acc, curr) => {
      acc[curr.module_name] = {
        can_view: curr.can_view,
        can_create: curr.can_create,
        can_edit: curr.can_edit,
        can_delete: curr.can_delete,
      };
      return acc;
    }, {} as PermissionMap);
  }, [permissions]);


  return (
    <UserContext.Provider
      value={{
        user: user ?? null,
        permissions,
        permission,
        loading: isLoading || permissionsLoading,
        error: error ?? permError,
        refetchUser,
        refetchPermissions,
        reset,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};



// === Hook to use UserContext ===
export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) throw new Error('Oops! useUserContext needs to be inside a UserProvider.');
  return context;
};
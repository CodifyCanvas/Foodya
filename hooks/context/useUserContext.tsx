'use client';

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  useMemo,
  ReactNode,
} from 'react';
import useSWR from 'swr';
import { User, Permissions } from '@/lib/definations';

// ---- Types ----
interface ModulePermission {
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

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

// ---- Fetch User ----
const fetchUser = (url: string) => fetch(url).then((res) => res.json());

// ---- Context ----
const UserContext = createContext<UserContextType | undefined>(undefined);

// ---- Provider ----
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { data: user, error, isLoading, mutate } = useSWR<User>('/api/user', fetchUser);
  const [permissions, setPermissions] = useState<Permissions[] | null>(null);
  const [permError, setPermError] = useState<Error | null>(null);
  const [permissionsLoading, setPermissionsLoading] = useState<boolean>(false);

  // Fetch permissions from API
  const fetchPermissions = useCallback(async (role_id: string) => {
  setPermissionsLoading(true); // ⬅️ Start loading
  try {
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
    setPermissionsLoading(false); // ⬅️ Done loading
  }
}, []);


  // Refetch permissions when needed
  const refetchPermissions = useCallback(async () => {
    if (user?.role_id) await fetchPermissions(user.role_id);
  }, [user?.role_id, fetchPermissions]);

  // Fetch permissions when user.role_id is available
  useEffect(() => {
    if (user?.role_id) {
      fetchPermissions(user.role_id);
    }
  }, [user?.role_id, fetchPermissions]);

  // Refetch user
  const refetchUser = useCallback(() => {
    mutate();
  }, [mutate]);

  // Reset all user-related state
  const reset = useCallback(() => {
    mutate(null as unknown as User, false);
    setPermissions(null);
    setPermError(null);
  }, [mutate]);

  // Create permission object like: permission.roles.can_view
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

// ---- Hook ----
export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUserContext must be used within a UserProvider');
  return context;
};

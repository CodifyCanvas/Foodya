'use client';

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  useMemo,
  ReactNode,
  useRef,
} from 'react';
import useSWR from 'swr';
import { User, Permissions, ModulePermission } from '@/lib/definations';
import toast from 'react-hot-toast';
import { swrFetcher } from '@/lib/swr';

/** === Types === */
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

/** === Context === */
const UserContext = createContext<UserContextType | undefined>(undefined);

/** === Provider === */
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { data: user, error: userError, isLoading: userLoading, mutate } = useSWR<User>(
    '/api/user',
    swrFetcher,
    {
      revalidateOnFocus: false, // ⚡ avoid unnecessary refetches
      shouldRetryOnError: false,
    }
  );

  const [permissions, setPermissions] = useState<Permissions[] | null>(null);
  const [permError, setPermError] = useState<Error | null>(null);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const mountedRef = useRef(true);

  /** === Fetch Permissions (with unmount safety + toast control) === */
  const fetchPermissions = useCallback(async (role_id: string) => {
    if (!mountedRef.current) return;
    setPermissionsLoading(true);

    const toastId = 'permission-toast';
    try {
      toast.loading('Fetching permissions...', { id: toastId });

      const res = await fetch('/api/permission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: Number(role_id) }),
      });

      if (!res.ok) throw new Error('Failed to fetch permissions');
      const data: Permissions[] = await res.json();

      if (mountedRef.current) {
        setPermissions(data);
        setPermError(null);
      }
    } catch (err) {
      if (mountedRef.current) {
        setPermissions(null);
        setPermError(err as Error);
      }
    } finally {
      if (mountedRef.current) {
        setPermissionsLoading(false);
        toast.dismiss(toastId);
      }
    }
  }, []);

  /** === Auto-load permissions when role_id changes === */
  useEffect(() => {
    mountedRef.current = true;

    if (user?.role_id) {
      fetchPermissions(user.role_id);
    } else {
      setPermissions(null);
    }

    return () => {
      mountedRef.current = false;
      toast.dismiss('permission-toast');
    };
  }, [user?.role_id, fetchPermissions]);

  /** === Manual refetchers === */
  const refetchUser = useCallback(() => mutate(), [mutate]);

  const refetchPermissions = useCallback(async () => {
    if (user?.role_id) {
      await fetchPermissions(user.role_id);
    }
  }, [user?.role_id, fetchPermissions]);

  /** === Reset Context === */
  const reset = useCallback(() => {
    mutate(null as unknown as User, false);
    setPermissions(null);
    setPermError(null);
  }, [mutate]);

  /** === Memoized Permission Map === */
  const permission = useMemo(() => {
    if (!permissions?.length) return {};
    return Object.fromEntries(
      permissions.map((p) => [
        p.module_name,
        {
          can_view: p.can_view,
          can_create: p.can_create,
          can_edit: p.can_edit,
          can_delete: p.can_delete,
        },
      ])
    );
  }, [permissions]);

  /** === Combined State === */
  const loading = userLoading || permissionsLoading;
  const error = userError ?? permError;

  /** === Context Value (memoized) === */
  const contextValue = useMemo<UserContextType>(
    () => ({
      user: user ?? null,
      permissions,
      permission,
      loading,
      error,
      refetchUser,
      refetchPermissions,
      reset,
    }),
    [user, permissions, permission, loading, error, refetchUser, refetchPermissions, reset]
  );

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
};

/** === Hook === */
export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};

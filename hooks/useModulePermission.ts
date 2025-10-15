import { getLastPathSegment } from "@/lib/utils";
import { useUserContext } from "./context/useUserContext";
import { usePathname } from "next/navigation";



/**
 * === List of supported permission actions. ===
 */
type PermissionAction = 'can_view' | 'can_create' | 'can_edit' | 'can_delete';



/**
 * === Hook return structure with permission flags and module info. ===
 */
interface ModulePermissionResult {
  moduleName: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  loading: boolean;
}



/**
 * === Custom hook to determine user's permissions for the current module based on URL. ===
 * 
 * - Extracts the module name from the current pathname.
 * - Reads user permissions from context.
 * - Returns booleans for each permission action (view, create, edit, delete).
 *
 * @returns {ModulePermissionResult} - Permission flags and module name.
 */
export const useModulePermission = (): ModulePermissionResult => {
  const pathname = usePathname();
  const { permission, loading } = useUserContext();

  // === Derive module name from the current route ===
  const moduleName = getLastPathSegment(pathname);



  /**
   * === Check if user has a specific permission for the current module. ===
   *
   * @param {PermissionAction} action - The permission action to check.
   * @returns {boolean} - True if user has permission, false otherwise.
   */
  const hasPermission = (action: PermissionAction): boolean => {
    return permission?.[moduleName]?.[action] ?? false;
  };



  // === Return default permissions while user data is loading ===
  if (loading) {
    return {
      moduleName,
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      loading: true,
    };
  }

  // === Return actual permission flags ===
  return {
    moduleName,
    canView: hasPermission('can_view'),
    canCreate: hasPermission('can_create'),
    canEdit: hasPermission('can_edit'),
    canDelete: hasPermission('can_delete'),
    loading: false,
  };
};

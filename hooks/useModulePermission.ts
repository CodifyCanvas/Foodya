import { getLastPathSegment } from "@/lib/utils";
import { useUserContext } from "./context/useUserContext";
import { usePathname } from "next/navigation";

export const useModulePermission = () => {
  const pathname = usePathname();
  const { permission, loading } = useUserContext();
  const moduleName = getLastPathSegment(pathname);

  const hasPermission = (action: 'can_view' | 'can_create' | 'can_edit' | 'can_delete') => {
    return permission?.[moduleName]?.[action] ?? false;
  };

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

  return {
    moduleName,
    canView: hasPermission('can_view'),
    canCreate: hasPermission('can_create'),
    canEdit: hasPermission('can_edit'),
    canDelete: hasPermission('can_delete'),
    loading: false,
  };
};

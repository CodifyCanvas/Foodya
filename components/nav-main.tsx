import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { ChevronRight, TriangleAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { navLink } from "@/constants";
import { usePathname } from "next/navigation";
import { cn, getLastPathSegment } from "@/lib/utils";
import { useUserContext } from "@/hooks/context/useUserContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type NavLinks =
  | { heading: string }
  | {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  };

export function NavMain() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const contentRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const router = useRouter();
  const { permission } = useUserContext();
  const path = usePathname();

  /**
   * Handles navigation with permission check.
   * If permission is missing, shows error toast.
   */
  const handleNavigation = useCallback(
  (url: string) => {
    const lastSegment = getLastPathSegment(url)

    if (permission?.[lastSegment]?.can_view) {
      router.push(url);
    } else {
      toast.custom(
        <div className="flex items-center gap-3 bg-red-500 text-white px-5 py-3 rounded-lg shadow-lg">
          <TriangleAlert className="w-5 h-5 text-white" />
          <span>You don&apos;t have permission.</span>
        </div>,
        {
          position: 'top-right',
          duration: 4000,
        }
      );
    }
  },
  [permission, router]
);


  /**
   * Animates dropdown open/close using GSAP
   * Runs only when openDropdown or nav items change
   */
  const items: NavLinks[] = navLink;

  useEffect(() => {
    items.forEach((item) => {
      if ("title" in item) {
        const el = contentRefs.current[item.title];
        if (!el) return;

        if (openDropdown === item.title) {
          gsap.killTweensOf(el);
          el.style.display = "block";

          const fullHeight = el.scrollHeight;

          gsap.fromTo(
            el,
            { height: 0, opacity: 0 },
            {
              height: fullHeight,
              opacity: 1,
              duration: 0.4,
              ease: "power2.out",
              onComplete: () => {
                el.style.height = "auto"; // allow dynamic height after animation
              },
            }
          );
        } else {
          gsap.killTweensOf(el);
          gsap.to(el, {
            height: 0,
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
              el.style.display = "none";
              el.style.height = "0";
            },
          });
        }
      }
    });
  }, [openDropdown, items]);

  return (
    <SidebarGroup>
      <SidebarMenu>
        {navLink.map((item, index) =>
          "heading" in item ? (
            <SidebarGroupLabel
              key={`heading-${index}`}
              className="mt-4 text-xs text-gray-600 uppercase font-rubik-400"
            >
              {item.heading}
            </SidebarGroupLabel>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                onClick={() =>
                  setOpenDropdown((prev) =>
                    prev === item.title ? null : item.title
                  )
                }
                tooltip={item.title}
                className="hover:bg-emerald-200 focus:bg-emerald-200 focus:hover:bg-emerald-300"
              >
                {item.icon && <item.icon className="mr-2 size-4" />}
                <span className="text-sm font-rubik-400">{item.title}</span>
                <ChevronRight
                  className={`ml-auto transition-transform duration-200 ${openDropdown === item.title ? "rotate-90" : ""
                    }`}
                />
              </SidebarMenuButton>

              {/* Dropdown container */}
              <div
                ref={(el) => {
                  contentRefs.current[item.title] = el;
                }}
                style={{
                  height: 0,
                  opacity: 0,
                  overflow: "hidden",
                  display: "none",
                }}
              >
                <SidebarMenuSub>
                  {item.items?.map((subItem) => {
                    const isActivePath = path === subItem.url;

                    return (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          onClick={() =>
                            handleNavigation(subItem.url)
                          }
                          asChild
                          className={cn(
                            "hover:bg-emerald-100",
                            isActivePath &&
                            "bg-emerald-600 text-white hover:bg-emerald-500 hover:text-white"
                          )}
                        >
                          <span className="font-rubik-400 text-[13px]">
                            {subItem.title}
                          </span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    );
                  })}
                </SidebarMenuSub>
              </div>
            </SidebarMenuItem>
          )
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}

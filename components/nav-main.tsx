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
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { navLink } from "@/constants";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { usePermissionNavigation } from "@/hooks/usePermissionNavigation";
import { Kbd, KbdGroup } from "./ui/kbd";



export type NavSubItem = {
  title: string;
  url: string;
  shortcuts?: string[];
};

type NavLinks =
  | { heading: string }
  | {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: NavSubItem[];
  };



export function NavMain() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const contentRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const path = usePathname();

  /**
   * Handles navigation with permission check.
   * If permission is missing, shows error toast.
   */
  const { handleNavigation } = usePermissionNavigation();


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
                  {item.items?.map((subItem: NavSubItem) => {
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
                          <p className="font-rubik-400 text-[13px] flex flex-row justify-between">
                            <span
                              className="truncate max-w-[160px]"
                              title={subItem.title} // Shows full title on hover
                            >
                              {subItem.title}
                            </span>
                            <ShortcutHint shortcuts={subItem.shortcuts} />
                          </p>
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


function ShortcutHint({ shortcuts }: { shortcuts?: string[] }) {
  if (!shortcuts?.length) return null;

  return (
    <KbdGroup>
      {shortcuts.map((key, index) => (
        <React.Fragment key={index}>
          <Kbd className="text-xs">{key}</Kbd>
          {index < shortcuts.length - 1 && (
            <span className="px-0.5 text-xs text-gray-800 dark:text-white">
              +
            </span>
          )}
        </React.Fragment>
      ))}
    </KbdGroup>
  );
}

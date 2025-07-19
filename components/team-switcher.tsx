"use client"

import * as React from "react"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Image from "next/image"
import { logo } from "@/constants"

export function TeamSwitcher() {

  return (
    <SidebarMenu>
      <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className=" text-sidebar-primary-foreground flex aspect-square size-9
              data-[state=open]:size-12 items-center justify-center rounded-lg">
                <Image src={logo.main}
              alt="logo"
              width={48}
              height={48}
              className="w-full h-full object-contain"/>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium font-rubik-500 text-xl">Foodya</span>
                <span className="truncate text-xs font-rubik-400">Find it, Eat it, Love it</span>
              </div>
            </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

"use client"

import * as React from "react"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import Image from "next/image"
import { appConfigurations, logo } from "@/constants"
import Link from "next/link"

export function TeamSwitcher() {

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Link href={appConfigurations.SideBarIconURL}>
          <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent cursor-pointer data-[state=open]:text-sidebar-accent-foreground">
            <div className=" text-sidebar-primary-foreground flex aspect-square size-8
              data-[state=open]:size-12 items-center justify-center rounded-lg">
              <Image src={logo.main} alt="logo" width={120} height={120} priority className="object-contain rounded-md" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium font-rubik-500 text-xl">Foodya</span>
              <span className="truncate text-xs font-rubik-400">Find it, Eat it, Love it</span>
            </div>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
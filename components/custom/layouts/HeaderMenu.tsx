"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { MenuIcon } from "lucide-react";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HeaderMenuCards as cards } from "@/constants";
import { usePermissionNavigation } from "@/hooks/usePermissionNavigation";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";



// --------------------- Main Header Component ---------------------
export function MainHeaderMenu() {
  const { handleNavigation } = usePermissionNavigation();
  const isMobile = useIsMobile()

  return (<>
    {isMobile
      ? <HeaderMenuMobile handleNavigation={handleNavigation} />
      : <HeaderMenuDesktop handleNavigation={handleNavigation} />
    }
  </>
  )
}



// --------------------- Main Header Desktop ---------------------
export function HeaderMenuDesktop({ handleNavigation }: { handleNavigation: (url: string) => void }) {
  return (
    <NavigationMenu viewport={true} className="hidden md:block">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Dashboard</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {cards.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  icon={component.icon}
                  href={component.href}
                  handleNavigation={handleNavigation}
                >
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Developer</NavigationMenuTrigger>
          <NavigationMenuContent>
            <DeveloperInfo />
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="#" className="font-rubik-500">Help</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

      </NavigationMenuList>
    </NavigationMenu>
  );
}



// --------------------- Main Header Mobile ---------------------
export function HeaderMenuMobile({ handleNavigation }: { handleNavigation: (url: string) => void }) {
  return (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <button aria-label="Open menu">
            <MenuIcon size={17} />
          </button>
        </SheetTrigger>

        <SheetHeader className="sr-only">
          <SheetTitle>Sidebar</SheetTitle>
          <SheetDescription>Displays the mobile sidebar.</SheetDescription>
        </SheetHeader>

        <SheetContent side="right" className="w-[300px] p-3 pt-6 overflow-y-auto">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Dashboard</AccordionTrigger>
              <AccordionContent>
                <DashboardLinks handleNavigation={handleNavigation} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>Developer</AccordionTrigger>
              <AccordionContent>
                <DeveloperInfo />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>Help</AccordionTrigger>
              <AccordionContent>
                <p>Contact us</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// --------------------- Reusable cards For Desktop ---------------------
function ListItem({
  title,
  icon,
  children,
  href,
  handleNavigation,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string; icon?: string; handleNavigation: (url: string) => void }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Button variant='ghost' onClick={() => handleNavigation(href)} className="flex py-7 cursor-pointer w-full flex-row items-center justify-start gap-3">
          {icon && (
            <div className="min-w-10 min-h-10 flex items-center justify-center relative overflow-hidden rounded-sm bg-black/5 transition-colors duration-200">
              <Image src={icon} alt="icon" width={48} height={48} className="object-contain absolute w-7 h-7" />
            </div>
          )}
          <div className="flex flex-col">
            <div className="text-sm font-medium text-left font-rubik-500 leading-none">{title}</div>
            <p className="text-muted-foreground font-rubik-400 text-xs line-clamp-2 mt-1 leading-snug">{children}</p>
          </div>
        </Button>
      </NavigationMenuLink>
    </li>
  );
}



// --------------------- Reusable Cards for Mobile ---------------------
function DashboardLinks({ handleNavigation }: { handleNavigation: (url: string) => void }) {
  return (
    <nav className="p-2 flex flex-col gap-2">
      {cards.map((c) => (
        <Button
          key={c.title}
          variant="ghost"
          onClick={() => handleNavigation(c.href)}
          className="flex items-center justify-start gap-2 h-12 p-2 hover:bg-accent rounded"
        >
          <div className="bg-black/5 w-8 h-8 items-center justify-center flex rounded-sm">
            <Image src={c.icon} width={24} height={24} alt="icon" />
          </div>
          <span className="font-rubik-500">{c.title}</span>
        </Button>
      ))}
    </nav>
  );
}


// --------------------- Developer Dropdown ---------------------
function DeveloperInfo() {
  return (
    <div className="flex flex-col gap-2 md:w-[400px] md:flex-row lg:w-[500px]">
      <div className="row-span-3">
        <div className="from-muted/50 aspect-square to-muted flex flex-col justify-end rounded-md bg-linear-to-b p-2 select-none">
          <Image src="/profile/shahzaib-awan.png" width={300} height={300} alt="developer" />
        </div>
      </div>
      <div className="min-w-56 text-sm font-rubik-400 gap-2 flex flex-col">
        <h3 className="font-semibold text-lg text-emerald-600">Shahzaib Awan</h3>
        <h3>Age: 20 Years</h3>
        <h3>Developer: Full-Stack Developer</h3>
        <h3>Experience: 2 Year</h3>
        <h3>Contact No: 0311-8480102</h3>
      </div>
    </div>
  );
}
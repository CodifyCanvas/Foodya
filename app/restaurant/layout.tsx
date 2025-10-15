import { AppSidebar } from "@/components/app-sidebar";
import { DbChecker } from "@/components/custom/Db/db-health-checker";
import { HeaderMenu, HeaderMenuMobile } from "@/components/custom/layouts/HeaderMenu";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UserProvider } from "@/hooks/context/useUserContext";

export default function Applayout({ children }: { children: React.ReactNode }) {

  return (
    <UserProvider>
      <SidebarProvider className="bg-blue-100 font-rubik">

        {/* Database Health Checker  */}
        <DbChecker />

        {/* Sidebar */}
        <AppSidebar />

        {/* Main content */}
        <SidebarInset className="flex flex-col gap-4 pl-2 md:pl-0 pr-2">

          {/* Header */}
          <header className="flex h-16 pt-4 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-16">
            <div className="bg-white p-3 px-4 rounded-lg w-full flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <div className="w-full flex items-center pt-1 md:pt-0 justify-end md:justify-start">
                <HeaderMenu />
                <HeaderMenuMobile />
              </div>
            </div>
          </header>

          {/* Page content area */}
          <main className="bg-transparent flex-1 mb-2 font-rubik-400">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </UserProvider>
  );
}
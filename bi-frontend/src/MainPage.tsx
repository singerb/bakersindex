import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Outlet } from "react-router"
import { AuthenticationGuard } from "./components/authentication-guard"
import queryClient from "@/query-client";
import client from "@/auth0-client";
import { loadFormulas, type Formulas } from "@/api";

export async function clientLoader() {
  if (!await client.isAuthenticated()) {
    await client.loginWithRedirect({appState: {returnTo: `${window.location.pathname}${window.location.search}`}});
    return;
  }
  const token = await client.getTokenSilently();
  const query = queryClient.fetchQuery({ queryKey: ['formulas'], queryFn: () => loadFormulas(token)});

  return await query;
}
clientLoader.hydrate = true as const;


function MainPage({formulas}: {formulas: Formulas | undefined}) {
  return (
    <SidebarProvider>
      <AppSidebar formulas={formulas} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}

function AuthedMainPage({loaderData: formulas}: {loaderData: Formulas | undefined}) {
  const component = () => <MainPage formulas={formulas} />;
  return <AuthenticationGuard component={component} />;
}

export default AuthedMainPage;

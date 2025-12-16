"use client"

import * as React from "react"
import {
  ListTodo,
  SquarePlus,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { NavLink } from "react-router"
import { type Formulas } from "@/api"

// This is sample data.
const data = {
  navMain: [
    {
      title: "Add new formula",
      url: "new",
      icon: SquarePlus,
    },
  ],
};

// TODO: how to make the /app NavLink not need to know the "app" part

export function AppSidebar({ formulas, ...props }: React.ComponentProps<typeof Sidebar> & { formulas: Formulas | undefined }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavUser />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Formulas">
                <NavLink to="/formulas">
                  <ListTodo />
                </NavLink>
                <NavLink to="/formulas">
                  Formulas
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuSub>
              {(formulas || []).map((item) => (
                <SidebarMenuSubItem key={item.id}>
                  <SidebarMenuButton tooltip={item.name}>
                    <NavLink to={"/formula/" + item.id}>{item.name}</NavLink>
                  </SidebarMenuButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </SidebarMenu>
        </SidebarGroup>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

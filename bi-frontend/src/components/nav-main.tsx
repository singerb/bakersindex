import { type LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavLink } from "react-router"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
            <SidebarMenuItem key={item.url}>
                <SidebarMenuButton tooltip={item.title}>
                  <NavLink to={item.url}>
                    {item.icon && <item.icon />}
                  </NavLink>
                  <NavLink to={item.url}>
                    {item.title}
                  </NavLink>
                </SidebarMenuButton>
            </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

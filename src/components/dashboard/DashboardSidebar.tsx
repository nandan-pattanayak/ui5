import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useCredits } from '@/hooks/useCredits';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { 
  Search, 
  Users, 
  Target, 
  TrendingUp, 
  Zap,
  Database,
  List
} from 'lucide-react';

const menuItems = [
  {
    title: "Lead Generation",
    url: "/dashboard/lead-generation",
    icon: Search,
  },
  {
    title: "Lead Management",
    url: "/dashboard/lead-management",
    icon: Users,
  },
  {
    title: "Lead Enrichment",
    url: "/dashboard/lead-enrichment",
    icon: Target,
  },
  {
    title: "Competitor Analysis",
    url: "/dashboard/competitor-analysis",
    icon: TrendingUp,
  },
  {
    title: "Bulk Leads",
    url: "/dashboard/bulk-leads",
    icon: List,
  },
];

export const DashboardSidebar: React.FC = () => {
  const { state } = useSidebar();
  const { hasInsufficientCredits } = useCredits();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-blue-600 text-white font-semibold hover:cursor-grab" 
      : "hover:bg-gray-100 text-foreground hover:cursor-grab";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-white/95 backdrop-blur-lg border-r border-primary/10">
        {/* Logo Section */}
        <div className="p-6 border-b border-primary/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-soft rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-bold text-foreground">MarkAssist</h2>
                <p className="text-xs text-muted-foreground">AI Platform</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-primary font-semibold">
            {!isCollapsed ? "Main Menu" : ""}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={hasInsufficientCredits ? '#' : item.url} 
                      end 
                      className={({ isActive }) => `
                        ${getNavCls({ isActive })}
                        ${hasInsufficientCredits ? 'opacity-50' : ''}
                      `}
                      onClick={(e) => {
                        if (hasInsufficientCredits) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <item.icon className="w-5 h-5" />
                      {!isCollapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardSidebar;
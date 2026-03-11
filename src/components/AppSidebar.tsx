import { useState, useEffect, createContext, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Home, BarChart3, Wrench, Users, Calendar, FileText, 
  LogOut, Menu, X, Globe, Search, ChevronLeft, UserCircle, Shield, 
  Building2, ClipboardList, Plug, CreditCard, ChevronDown, ChevronRight
} from "lucide-react";
import logoSolarizeBranca from "@/assets/logo-solarize-branca.png";
import iconeSolarizeBranca from "@/assets/icone-solarize-branca.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Badge } from "@/components/ui/badge";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  href: string;
  roles?: string[];
  disabled?: boolean;
  badge?: string;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    label: "Principal",
    items: [
      { icon: Home, label: "Visão Geral", href: "/dashboard" },
    ],
  },
  {
    label: "Comercial",
    items: [
      { icon: BarChart3, label: "CRM", href: "/crm", roles: ["admin", "manager", "comercial", "super_admin"] },
      { icon: UserCircle, label: "Clientes", href: "/clients", roles: ["admin", "manager", "comercial", "super_admin"] },
      { icon: Calendar, label: "Agenda", href: "/schedule", roles: ["admin", "manager", "technician", "comercial", "super_admin"] },
    ],
  },
  {
    label: "Operações",
    items: [
      { icon: Wrench, label: "Instalações", href: "/installations", roles: ["admin", "manager", "technician", "comercial", "super_admin"] },
      { icon: FileText, label: "Documentos", href: "/documents", roles: ["admin", "manager", "comercial", "technician", "super_admin"] },
    ],
  },
  {
    label: "Gestão",
    items: [
      { icon: ClipboardList, label: "Relatórios", href: "/reports", roles: ["admin", "manager", "super_admin"] },
      { icon: Users, label: "Usuários", href: "/users", roles: ["admin", "super_admin"] },
    ],
  },
  {
    label: "Social",
    items: [
      { icon: Globe, label: "Edição Site", href: "/site-editor", roles: ["admin", "manager", "super_admin"] },
      { icon: Plug, label: "Integrações", href: "/integrations", roles: ["admin", "manager", "super_admin"], disabled: true, badge: "Em breve" },
    ],
  },
];

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  setIsCollapsed: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

interface AppSidebarProps {
  user: any;
  profile: any;
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export function AppSidebar({ user, profile, isCollapsed, setIsCollapsed }: AppSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const location = useLocation();
  const navigate = useNavigate();
  const { workspace, isTrial, daysLeft } = useWorkspace();

  useEffect(() => {
    if (user) fetchUserRoles(user.id);
  }, [user]);

  const fetchUserRoles = async (userId: string) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    if (data) setUserRoles(data.map(r => r.role));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const isSuperAdmin = userRoles.includes("super_admin");

  const filterItems = (items: MenuItem[]) =>
    items.filter(item => {
      if (!item.roles) return true;
      if (userRoles.length === 0) return false;
      return item.roles.some(role => userRoles.includes(role));
    });

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const toggleGroup = (label: string) => {
    setCollapsedGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2.5 bg-sidebar text-sidebar-foreground rounded-xl shadow-lg"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <aside className={`fixed inset-y-0 left-0 z-40 bg-sidebar transform transition-all duration-300 lg:translate-x-0 ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      } ${isCollapsed ? "w-16" : "w-60"}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={`px-3 py-4 flex items-center ${isCollapsed ? "justify-center" : "justify-between"} cursor-pointer`}
            onClick={() => isCollapsed && setIsCollapsed(false)}>
            <div className="h-7 flex items-center">
              {isCollapsed 
                ? <img src={iconeSolarizeBranca} alt="Solarize" className="h-7 w-7 object-contain" />
                : <img src={logoSolarizeBranca} alt="Solarize" className="h-6 w-auto object-contain" />
              }
            </div>
            {!isCollapsed && (
              <button onClick={(e) => { e.stopPropagation(); toggleCollapse(); }}
                className="p-1 rounded-lg hover:bg-sidebar-accent text-sidebar-muted hover:text-sidebar-foreground transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Trial Badge */}
          {!isCollapsed && isTrial && daysLeft > 0 && (
            <div className="px-3 mb-2">
              <div className="bg-accent/20 rounded-lg px-2.5 py-1.5 text-center">
                <p className="text-[10px] font-medium text-accent">{daysLeft} dias restantes no trial</p>
              </div>
            </div>
          )}

          {/* Search */}
          {!isCollapsed && (
            <div className="px-3 mb-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sidebar-muted" />
                <Input placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 bg-sidebar-accent border-0 text-sidebar-foreground placeholder:text-sidebar-muted rounded-lg h-7 text-xs" />
              </div>
            </div>
          )}

          {/* Grouped Nav */}
          <nav className={`flex-1 ${isCollapsed ? "px-1.5" : "px-2"} overflow-y-auto`}>
            {menuGroups.map((group) => {
              const visibleItems = filterItems(group.items);
              if (visibleItems.length === 0) return null;
              const isGroupCollapsed = collapsedGroups[group.label] || false;

              return (
                <div key={group.label} className="mb-1">
                  {!isCollapsed && (
                    <button
                      onClick={() => toggleGroup(group.label)}
                      className="w-full flex items-center justify-between px-2 py-1 group"
                    >
                      <span className="text-[9px] font-semibold text-sidebar-muted uppercase tracking-widest">{group.label}</span>
                      <ChevronDown className={`w-3 h-3 text-sidebar-muted/50 transition-transform group-hover:text-sidebar-muted ${isGroupCollapsed ? "-rotate-90" : ""}`} />
                    </button>
                  )}
                  {!isGroupCollapsed && (
                    <div className="space-y-px">
                      {visibleItems.map((item) => {
                        const isActive = location.pathname === item.href;
                        if (item.disabled) {
                          return (
                            <div key={item.label}
                              title={isCollapsed ? item.label : undefined}
                              className={`flex items-center gap-2.5 ${isCollapsed ? "justify-center px-1.5" : "px-2.5"} py-1.5 rounded-lg text-xs font-medium opacity-40 cursor-not-allowed`}>
                              <item.icon className="w-4 h-4 flex-shrink-0 text-sidebar-muted" />
                              {!isCollapsed && (
                                <>
                                  <span className="text-sidebar-muted">{item.label}</span>
                                  {item.badge && (
                                    <Badge className="ml-auto bg-accent/80 text-accent-foreground text-[8px] px-1 py-0 h-3.5 font-medium">
                                      {item.badge}
                                    </Badge>
                                  )}
                                </>
                              )}
                            </div>
                          );
                        }
                        return (
                          <Link key={item.label} to={item.href} onClick={() => setIsMobileOpen(false)}
                            title={isCollapsed ? item.label : undefined}
                            className={`flex items-center gap-2.5 ${isCollapsed ? "justify-center px-1.5" : "px-2.5"} py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                              isActive ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                            }`}>
                            <item.icon className="w-4 h-4 flex-shrink-0" />
                            {!isCollapsed && <span>{item.label}</span>}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Super Admin link */}
            {isSuperAdmin && (
              <div className="mb-1">
                {!isCollapsed && (
                  <div className="px-2 py-1">
                    <span className="text-[9px] font-semibold text-sidebar-muted uppercase tracking-widest">Sistema</span>
                  </div>
                )}
                <Link to="/super-admin" onClick={() => setIsMobileOpen(false)}
                  title={isCollapsed ? "Super Admin" : undefined}
                  className={`flex items-center gap-2.5 ${isCollapsed ? "justify-center px-1.5" : "px-2.5"} py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    location.pathname === "/super-admin" ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  }`}>
                  <Shield className="w-4 h-4 flex-shrink-0" />
                  {!isCollapsed && <span>Super Admin</span>}
                </Link>
              </div>
            )}
          </nav>

          {/* User Profile + Subscription + Logout */}
          <div className={`p-2 border-t border-sidebar-border ${isCollapsed ? "flex flex-col items-center gap-1" : ""}`}>
            {!isCollapsed ? (
              <>
                <Link to="/company-profile" onClick={() => setIsMobileOpen(false)}
                  className="flex items-center gap-2.5 mb-1 p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors cursor-pointer">
                  <div className="w-7 h-7 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground font-semibold text-[10px]">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-sidebar-foreground truncate">{profile?.full_name || "Usuário"}</p>
                    <p className="text-[9px] text-sidebar-muted truncate">
                      {isSuperAdmin ? 'Super Admin' :
                       userRoles.includes('admin') ? 'Administrador' : 
                       userRoles.includes('manager') ? 'Gerente' :
                       userRoles.includes('comercial') ? 'Comercial' :
                       userRoles.includes('technician') ? 'Técnico' : 'Staff'}
                    </p>
                  </div>
                  <Building2 className="w-3.5 h-3.5 text-sidebar-muted" />
                </Link>
                <Link to="/subscription" onClick={() => setIsMobileOpen(false)}
                  className="flex items-center gap-2.5 px-2.5 py-1 rounded-lg text-[10px] font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Assinatura</span>
                </Link>
                <Button variant="ghost" size="sm"
                  className="w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent mt-0.5 h-6 text-[10px] px-2.5"
                  onClick={handleLogout}>
                  <LogOut className="w-3.5 h-3.5 mr-2" /> Sair
                </Button>
              </>
            ) : (
              <>
                <Link to="/company-profile" title="Perfil Empresa" onClick={() => setIsMobileOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  <Building2 className="w-4 h-4" />
                </Link>
                <Link to="/subscription" title="Assinatura" onClick={() => setIsMobileOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  <CreditCard className="w-4 h-4" />
                </Link>
                <button onClick={handleLogout} title="Sair"
                  className="p-1.5 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-30 lg:hidden" onClick={() => setIsMobileOpen(false)} />
      )}
    </>
  );
}

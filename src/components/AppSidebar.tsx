import { useState, useEffect, createContext, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Home, BarChart3, Wrench, Users, Calendar, FileText, 
  Settings, LogOut, Menu, X, Globe, Search, ChevronLeft, UserCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import logoNnEnergiaSolar from "@/assets/logo-nn-energia-solar.png";
import iconeNn from "@/assets/icone-nn.png";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
  coming?: boolean;
  roles?: string[];
}

const menuItems: MenuItem[] = [
  { icon: Home, label: "Visão Geral", href: "/dashboard" },
  { icon: BarChart3, label: "CRM", href: "/crm", roles: ["admin", "manager", "comercial"] },
  { icon: Wrench, label: "Instalações", href: "/installations", roles: ["admin", "manager", "technician", "comercial"] },
  { icon: UserCircle, label: "Clientes", href: "/clients", roles: ["admin", "manager", "comercial"] },
  { icon: Calendar, label: "Agenda", href: "/schedule", roles: ["admin", "manager", "technician", "comercial"] },
  { icon: Globe, label: "Edição Site", href: "/site-editor", roles: ["admin", "manager"] },
  { icon: Users, label: "Usuários", href: "/users", roles: ["admin"] },
  { icon: FileText, label: "Documentos", href: "/documents", roles: ["admin", "manager", "comercial", "technician"] },
];

// Context for sidebar collapse state
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
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchUserRoles(user.id);
    }
  }, [user]);

  const fetchUserRoles = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    
    if (data) {
      setUserRoles(data.map(r => r.role));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.roles) return true;
    if (userRoles.length === 0) return false;
    return item.roles.some(role => userRoles.includes(role));
  });

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2.5 bg-sidebar text-sidebar-foreground rounded-xl shadow-lg"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-sidebar transform transition-all duration-300 lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${isCollapsed ? "w-16" : "w-64"}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Brand */}
          <div 
            className={`p-4 flex items-center ${isCollapsed ? "justify-center" : "justify-between"} cursor-pointer`}
            onClick={() => isCollapsed && setIsCollapsed(false)}
          >
            <div className="h-10 flex items-center">
              <img 
                src={isCollapsed ? iconeNn : logoNnEnergiaSolar} 
                alt="NN Energia Solar" 
                className={`${isCollapsed ? "h-8" : "h-9"} object-contain transition-all`} 
              />
            </div>
            {!isCollapsed && (
              <button
                onClick={(e) => { e.stopPropagation(); toggleCollapse(); }}
                className="p-1.5 rounded-lg hover:bg-sidebar-accent text-sidebar-muted hover:text-sidebar-foreground transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search - hide when collapsed */}
          {!isCollapsed && (
            <div className="px-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sidebar-muted" />
                <Input
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-sidebar-accent border-0 text-sidebar-foreground placeholder:text-sidebar-muted rounded-xl h-10"
                />
              </div>
            </div>
          )}

          {/* Menu Label - hide when collapsed */}
          {!isCollapsed && (
            <div className="px-5 mb-2">
              <span className="text-xs font-medium text-sidebar-muted uppercase tracking-wider">
                Menu Principal
              </span>
            </div>
          )}

          {/* Navigation */}
          <nav className={`flex-1 ${isCollapsed ? "px-2" : "px-3"} space-y-1 overflow-y-auto`}>
            {filteredMenuItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.label}
                  to={item.coming ? "#" : item.href}
                  onClick={() => setIsMobileOpen(false)}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center gap-3 ${isCollapsed ? "justify-center px-2" : "px-3"} py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  } ${item.coming ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span>{item.label}</span>
                      {item.coming && (
                        <span className="ml-auto text-[10px] bg-sidebar-accent text-sidebar-muted px-2 py-0.5 rounded-full">
                          Breve
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className={`p-4 border-t border-sidebar-border ${isCollapsed ? "flex flex-col items-center" : ""}`}>
            {!isCollapsed ? (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-sidebar-foreground truncate">
                      {profile?.full_name || "Usuário"}
                    </p>
                    <p className="text-xs text-sidebar-muted truncate">
                      {userRoles.includes('admin') ? 'Administrador' : 
                       userRoles.includes('manager') ? 'Gerente' :
                       userRoles.includes('comercial') ? 'Comercial' :
                       userRoles.includes('technician') ? 'Técnico' : 'Staff'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </>
            ) : (
              <button
                onClick={handleLogout}
                title="Sair"
                className="p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}

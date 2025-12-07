import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Home, BarChart3, Wrench, Users, Calendar, FileText, 
  Settings, LogOut, Menu, X, Globe, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
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
  { icon: Wrench, label: "Instalações", href: "/installations", roles: ["admin", "manager", "technician"] },
  { icon: Users, label: "Portal Cliente", href: "/portal" },
  { icon: Globe, label: "Edição Site", href: "/site-editor", roles: ["admin", "manager"] },
  { icon: Settings, label: "Usuários", href: "/users", roles: ["admin"] },
  { icon: Calendar, label: "Agenda", href: "#", coming: true },
  { icon: FileText, label: "Documentos", href: "#", coming: true },
];

interface AppSidebarProps {
  user: any;
  profile: any;
}

export function AppSidebar({ user, profile }: AppSidebarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
    if (userRoles.length === 0) return true;
    return item.roles.some(role => userRoles.includes(role));
  });

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2.5 bg-sidebar text-sidebar-foreground rounded-xl shadow-lg"
      >
        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-sidebar transform transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Brand */}
          <div className="p-5 flex items-center gap-3">
            <div className="w-10 h-10 bg-sidebar-accent rounded-xl flex items-center justify-center overflow-hidden">
              <img src={iconeNn} alt="NN" className="w-7 h-7 object-contain" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sidebar-foreground font-semibold text-lg">NN Solar</span>
              <span className="text-xs bg-sidebar-accent text-sidebar-muted px-2 py-0.5 rounded-md">⌘K</span>
            </div>
          </div>

          {/* Search */}
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

          {/* Menu Label */}
          <div className="px-5 mb-2">
            <span className="text-xs font-medium text-sidebar-muted uppercase tracking-wider">
              Menu Principal
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            {filteredMenuItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {item.coming && (
                    <span className="ml-auto text-[10px] bg-sidebar-accent text-sidebar-muted px-2 py-0.5 rounded-full">
                      Breve
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Settings Label */}
          <div className="px-5 mb-2 mt-4">
            <span className="text-xs font-medium text-sidebar-muted uppercase tracking-wider">
              Configurações
            </span>
          </div>

          {/* Settings Menu */}
          <div className="px-3 mb-4 space-y-1">
            <Link
              to="/site-editor"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all"
            >
              <Settings className="w-5 h-5" />
              <span>Configurações</span>
            </Link>
          </div>

          {/* User Profile */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-success rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {profile?.full_name || "Usuário"}
                </p>
                <p className="text-xs text-sidebar-muted truncate">
                  {user?.email}
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
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
}

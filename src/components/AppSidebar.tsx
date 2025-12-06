import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Home, BarChart3, Wrench, Users, Calendar, FileText, 
  Settings, LogOut, Menu, X, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import logoFundoBranco from "@/assets/logo-fundo-branco.png";

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
    if (userRoles.length === 0) return true; // Show all if no roles assigned yet
    return item.roles.some(role => userRoles.includes(role));
  });

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-card rounded-xl shadow-md border border-border"
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border">
            <Link to="/">
              <img src={logoFundoBranco} alt="NN Energia Solar" className="h-8" />
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredMenuItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                  {item.coming && (
                    <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded-full">
                      Breve
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-solar-blue-light rounded-full flex items-center justify-center text-primary-foreground font-bold">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {profile?.full_name || "Usuário"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
}

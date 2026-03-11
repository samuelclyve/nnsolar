import { useEffect, useState, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { AppSidebar } from "./AppSidebar";
import { SubscriptionGuard } from "./SubscriptionGuard";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationsPanel } from "./NotificationsPanel";
import { SupportChat } from "./SupportChat";

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export function AppLayout() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") return document.documentElement.classList.contains("dark");
    return false;
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate("/auth"); return; }
      setUser(session.user);
      fetchProfile(session.user.id);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { navigate("/auth"); return; }
      setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
    if (data) setProfile(data);
  };

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.classList.toggle("dark", newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <SubscriptionGuard>
      <div className="min-h-screen bg-background flex w-full">
        <AppSidebar user={user} profile={profile} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        
        <main className={`flex-1 transition-all duration-300 ${isCollapsed ? "lg:ml-16" : "lg:ml-64"}`}>
          <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md">
            <div className="flex items-center justify-end px-6 lg:px-8 h-16">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={toggleTheme}
                  className="rounded-full w-10 h-10 text-muted-foreground hover:text-foreground">
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </Button>
                <NotificationsPanel userId={user?.id} />
                <SupportChat />
              </div>
            </div>
          </header>

          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial="initial" animate="animate" exit="exit"
              variants={pageVariants} transition={{ duration: 0.2, ease: "easeOut" }} className="p-6 lg:p-8">
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </SubscriptionGuard>
  );
}

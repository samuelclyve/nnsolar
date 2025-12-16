import { useState, useEffect } from "react";
import { Bell, Check, Clock, MessageSquare, Wrench, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "installation" | "lead" | "schedule" | "message";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
}

interface NotificationsPanelProps {
  userId?: string;
}

export function NotificationsPanel({ userId }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
      subscribeToNotifications();
    }
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      // Fetch recent installations changes
      const { data: installations } = await supabase
        .from("installations")
        .select("id, client_name, status, updated_at")
        .order("updated_at", { ascending: false })
        .limit(5);

      // Fetch recent leads
      const { data: leads } = await supabase
        .from("leads")
        .select("id, name, status, updated_at")
        .order("updated_at", { ascending: false })
        .limit(5);

      // Fetch notification logs
      const { data: notificationLogs } = await supabase
        .from("notification_logs")
        .select("*, installations(client_name)")
        .order("sent_at", { ascending: false })
        .limit(5);

      const notifs: Notification[] = [];

      // Add installation notifications
      installations?.forEach((inst) => {
        notifs.push({
          id: `inst-${inst.id}`,
          type: "installation",
          title: "Instalação Atualizada",
          message: `${inst.client_name} - Status: ${getStatusLabel(inst.status)}`,
          timestamp: new Date(inst.updated_at || new Date()),
          read: false,
          link: "/installations",
        });
      });

      // Add lead notifications
      leads?.forEach((lead) => {
        notifs.push({
          id: `lead-${lead.id}`,
          type: "lead",
          title: "Lead Atualizado",
          message: `${lead.name} - ${getLeadStatusLabel(lead.status)}`,
          timestamp: new Date(lead.updated_at || new Date()),
          read: false,
          link: "/crm",
        });
      });

      // Add message notifications
      notificationLogs?.forEach((log: any) => {
        notifs.push({
          id: `msg-${log.id}`,
          type: "message",
          title: "Mensagem Enviada",
          message: `WhatsApp para ${log.installations?.client_name || "Cliente"}`,
          timestamp: new Date(log.sent_at),
          read: true,
          link: "/installations",
        });
      });

      // Sort by timestamp
      notifs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      setNotifications(notifs.slice(0, 10));
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    // Subscribe to realtime changes
    const installationsChannel = supabase
      .channel("installations-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "installations" },
        (payload) => {
          const newNotif: Notification = {
            id: `inst-${Date.now()}`,
            type: "installation",
            title: payload.eventType === "INSERT" ? "Nova Instalação" : "Instalação Atualizada",
            message: `${(payload.new as any)?.client_name || "Cliente"} foi ${payload.eventType === "INSERT" ? "criado" : "atualizado"}`,
            timestamp: new Date(),
            read: false,
            link: "/installations",
          };
          setNotifications((prev) => [newNotif, ...prev].slice(0, 10));
        }
      )
      .subscribe();

    const leadsChannel = supabase
      .channel("leads-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "leads" },
        (payload) => {
          const newNotif: Notification = {
            id: `lead-${Date.now()}`,
            type: "lead",
            title: "Novo Lead!",
            message: `${(payload.new as any)?.name} entrou em contato`,
            timestamp: new Date(),
            read: false,
            link: "/crm",
          };
          setNotifications((prev) => [newNotif, ...prev].slice(0, 10));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(installationsChannel);
      supabase.removeChannel(leadsChannel);
    };
  };

  const getStatusLabel = (status: string | null) => {
    const labels: Record<string, string> = {
      project: "Projeto",
      approval: "Aprovação",
      installation: "Instalação",
      inspection: "Vistoria",
      active: "Ativo",
    };
    return labels[status || ""] || status || "Desconhecido";
  };

  const getLeadStatusLabel = (status: string | null) => {
    const labels: Record<string, string> = {
      new: "Novo Lead",
      analysis: "Pré-análise",
      visit: "Visita Agendada",
      proposal: "Proposta Enviada",
      negotiation: "Negociação",
      closed: "Fechado",
      lost: "Perdido",
    };
    return labels[status || ""] || status || "Novo";
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "installation":
        return <Wrench className="w-4 h-4" />;
      case "lead":
        return <Clock className="w-4 h-4" />;
      case "schedule":
        return <Calendar className="w-4 h-4" />;
      case "message":
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: Notification["type"]) => {
    switch (type) {
      case "installation":
        return "bg-primary/10 text-primary";
      case "lead":
        return "bg-blue-500/10 text-blue-500";
      case "schedule":
        return "bg-purple-500/10 text-purple-500";
      case "message":
        return "bg-green-500/10 text-green-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-destructive text-destructive-foreground"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold">Notificações</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-7">
              <Check className="w-3 h-3 mr-1" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer relative group",
                    !notification.read && "bg-primary/5"
                  )}
                  onClick={() => {
                    markAsRead(notification.id);
                    if (notification.link) {
                      window.location.href = notification.link;
                      setIsOpen(false);
                    }
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearNotification(notification.id);
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
                  >
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                  
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-full flex-shrink-0", getTypeColor(notification.type))}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{notification.title}</p>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{notification.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatDistanceToNow(notification.timestamp, { locale: ptBR, addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

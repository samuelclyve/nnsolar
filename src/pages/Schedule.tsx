import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, parseISO, isToday, startOfWeek, endOfWeek, addWeeks, subWeeks, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, MapPin, GripVertical, CalendarDays, CalendarRange } from "lucide-react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useDraggable, useDroppable, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { useWorkspace } from "@/hooks/useWorkspace";

interface Installation {
  id: string;
  client_name: string;
  address: string | null;
  city: string | null;
  status: string | null;
  estimated_start: string | null;
  estimated_end: string | null;
  actual_start: string | null;
  actual_end: string | null;
  power_kwp: number | null;
}

interface ScheduleEvent {
  id: string;
  installation_id: string;
  installation: Installation;
  date: string;
  type: "start" | "end";
}

const statusColors: Record<string, string> = {
  project: "bg-blue-500",
  approval: "bg-yellow-500",
  installation: "bg-primary",
  inspection: "bg-purple-500",
  active: "bg-success",
};

const statusLabels: Record<string, string> = {
  project: "Projeto",
  approval: "Aprovação",
  installation: "Instalação",
  inspection: "Vistoria",
  active: "Ativo",
};

const eventTypeLabels: Record<string, string> = {
  start: "Início",
  end: "Conclusão",
};

// Draggable Event Component
function DraggableEvent({ event, compact = false }: { event: ScheduleEvent; compact?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: event.id,
    data: event,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 100 : 1,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "px-2 py-1 rounded text-white cursor-grab active:cursor-grabbing flex items-center gap-1",
        statusColors[event.installation.status || "project"],
        isDragging && "opacity-50 shadow-lg",
        compact ? "text-[10px]" : "text-xs"
      )}
    >
      <GripVertical className={cn("flex-shrink-0", compact ? "w-2 h-2" : "w-3 h-3")} />
      <span className="truncate">{event.installation.client_name}</span>
      <span className="text-white/70 ml-auto">({eventTypeLabels[event.type]})</span>
    </div>
  );
}

// Droppable Day Cell for Monthly View
function DroppableDayMonth({ 
  day, 
  events, 
  isSelected, 
  isToday: today, 
  onClick 
}: { 
  day: Date; 
  events: ScheduleEvent[]; 
  isSelected: boolean; 
  isToday: boolean; 
  onClick: () => void;
}) {
  const dateStr = format(day, "yyyy-MM-dd");
  const { setNodeRef, isOver } = useDroppable({
    id: dateStr,
    data: { date: day },
  });

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className={cn(
        "h-24 p-1 rounded-lg cursor-pointer transition-all border",
        isSelected ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted/50",
        today && "ring-2 ring-primary/30",
        isOver && "bg-primary/20 border-primary border-dashed"
      )}
    >
      <div className={cn(
        "text-sm font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full",
        today && "bg-primary text-white"
      )}>
        {format(day, "d")}
      </div>
      <div className="space-y-0.5 overflow-hidden">
        {events.slice(0, 2).map((event) => (
          <DraggableEvent key={event.id} event={event} compact />
        ))}
        {events.length > 2 && (
          <div className="text-[10px] text-muted-foreground px-1">
            +{events.length - 2} mais
          </div>
        )}
      </div>
    </div>
  );
}

// Droppable Day Cell for Weekly View
function DroppableDayWeek({ 
  day, 
  events, 
  isSelected, 
  isToday: today, 
  onClick 
}: { 
  day: Date; 
  events: ScheduleEvent[]; 
  isSelected: boolean; 
  isToday: boolean; 
  onClick: () => void;
}) {
  const dateStr = format(day, "yyyy-MM-dd");
  const { setNodeRef, isOver } = useDroppable({
    id: dateStr,
    data: { date: day },
  });

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className={cn(
        "min-h-[200px] p-2 rounded-lg cursor-pointer transition-all border flex-1",
        isSelected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50",
        today && "ring-2 ring-primary/30",
        isOver && "bg-primary/20 border-primary border-dashed"
      )}
    >
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
        <div className={cn(
          "text-lg font-bold w-8 h-8 flex items-center justify-center rounded-full",
          today && "bg-primary text-white"
        )}>
          {format(day, "d")}
        </div>
        <div>
          <p className="text-sm font-medium">{format(day, "EEEE", { locale: ptBR })}</p>
          <p className="text-xs text-muted-foreground">{format(day, "dd/MM")}</p>
        </div>
      </div>
      <div className="space-y-2">
        {events.map((event) => (
          <DraggableEvent key={event.id} event={event} />
        ))}
        {events.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">Nenhum evento</p>
        )}
      </div>
    </div>
  );
}

export default function Schedule() {
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeEvent, setActiveEvent] = useState<ScheduleEvent | null>(null);

  // Form state for new scheduling
  const [selectedInstallation, setSelectedInstallation] = useState<string>("");
  const [scheduleDate, setScheduleDate] = useState<string>("");
  const [scheduleType, setScheduleType] = useState<"estimated_start" | "estimated_end">("estimated_start");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  const { workspaceId } = useWorkspace();

  useEffect(() => {
    if (workspaceId) fetchInstallations();
  }, [workspaceId]);

  const fetchInstallations = async () => {
    try {
      const { data, error } = await supabase
        .from("installations")
        .select("*")
        .eq("workspace_id", workspaceId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInstallations(data || []);
    } catch (error) {
      console.error("Error fetching installations:", error);
      toast.error("Erro ao carregar instalações");
    } finally {
      setIsLoading(false);
    }
  };

  const getAllEvents = (): ScheduleEvent[] => {
    const events: ScheduleEvent[] = [];
    
    installations.forEach((installation) => {
      if (installation.estimated_start) {
        events.push({
          id: `${installation.id}-start`,
          installation_id: installation.id,
          installation,
          date: installation.estimated_start,
          type: "start",
        });
      }
      if (installation.estimated_end) {
        events.push({
          id: `${installation.id}-end`,
          installation_id: installation.id,
          installation,
          date: installation.estimated_end,
          type: "end",
        });
      }
    });

    return events;
  };

  const getEventsForDate = (date: Date): ScheduleEvent[] => {
    const events = getAllEvents();
    return events.filter((event) => isSameDay(parseISO(event.date), date));
  };

  // Monthly view data
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });
  const firstDayOfMonth = startOfMonth(currentDate);
  const startPadding = firstDayOfMonth.getDay();
  const paddingDays = Array.from({ length: startPadding }, (_, i) => null);

  // Weekly view data
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handlePrevious = () => {
    if (viewMode === "month") {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === "month") {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const eventData = event.active.data.current as ScheduleEvent;
    setActiveEvent(eventData);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveEvent(null);

    if (!over) return;

    const draggedEvent = active.data.current as ScheduleEvent;
    const newDateStr = over.id as string;

    // Don't do anything if dropped on the same date
    if (draggedEvent.date === newDateStr) return;

    const fieldToUpdate = draggedEvent.type === "start" ? "estimated_start" : "estimated_end";

    try {
      const { error } = await supabase
        .from("installations")
        .update({ [fieldToUpdate]: newDateStr })
        .eq("id", draggedEvent.installation_id);

      if (error) throw error;

      toast.success(`${draggedEvent.installation.client_name} reagendado para ${format(parseISO(newDateStr), "dd/MM/yyyy")}`);
      fetchInstallations();
    } catch (error) {
      console.error("Error updating installation:", error);
      toast.error("Erro ao reagendar instalação");
    }
  };

  const handleSchedule = async () => {
    if (!selectedInstallation || !scheduleDate) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      const { error } = await supabase
        .from("installations")
        .update({ [scheduleType]: scheduleDate })
        .eq("id", selectedInstallation);

      if (error) throw error;
      
      toast.success("Agendamento salvo com sucesso!");
      setIsDialogOpen(false);
      setSelectedInstallation("");
      setScheduleDate("");
      fetchInstallations();
    } catch (error) {
      console.error("Error scheduling:", error);
      toast.error("Erro ao salvar agendamento");
    }
  };

  const todayEvents = getEventsForDate(new Date());
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const getHeaderTitle = () => {
    if (viewMode === "month") {
      return format(currentDate, "MMMM yyyy", { locale: ptBR });
    } else {
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
      return `${format(weekStart, "dd/MM")} - ${format(weekEnd, "dd/MM/yyyy")}`;
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Agenda</h1>
            <p className="text-muted-foreground">Arraste os eventos para reagendar instalações</p>
          </div>
          <div className="flex items-center gap-3">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "month" | "week")}>
              <TabsList>
                <TabsTrigger value="month" className="gap-2">
                  <CalendarDays className="w-4 h-4" />
                  Mês
                </TabsTrigger>
                <TabsTrigger value="week" className="gap-2">
                  <CalendarRange className="w-4 h-4" />
                  Semana
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Agendamento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agendar Instalação</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Instalação</Label>
                    <Select value={selectedInstallation} onValueChange={setSelectedInstallation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma instalação" />
                      </SelectTrigger>
                      <SelectContent>
                        {installations.map((inst) => (
                          <SelectItem key={inst.id} value={inst.id}>
                            {inst.client_name} - {inst.city || "Sem cidade"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de Agendamento</Label>
                    <Select value={scheduleType} onValueChange={(v) => setScheduleType(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="estimated_start">Data de Início</SelectItem>
                        <SelectItem value="estimated_end">Data de Conclusão</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Data</Label>
                    <Input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                    />
                  </div>
                  <Button className="w-full" onClick={handleSchedule}>
                    Salvar Agendamento
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 capitalize">
                <CalendarIcon className="w-5 h-5 text-primary" />
                {getHeaderTitle()}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handlePrevious}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Hoje
                </Button>
                <Button variant="outline" size="icon" onClick={handleNext}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                {viewMode === "month" ? (
                  <>
                    {/* Day names */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                        <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Monthly grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {paddingDays.map((_, index) => (
                        <div key={`padding-${index}`} className="h-24 p-1 bg-muted/30 rounded-lg" />
                      ))}
                      {daysInMonth.map((day) => {
                        const dayEvents = getEventsForDate(day);
                        const isSelected = selectedDate && isSameDay(day, selectedDate);
                        const today = isToday(day);

                        return (
                          <DroppableDayMonth
                            key={day.toISOString()}
                            day={day}
                            events={dayEvents}
                            isSelected={!!isSelected}
                            isToday={today}
                            onClick={() => setSelectedDate(day)}
                          />
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Weekly view */}
                    <div className="flex gap-2">
                      {weekDays.map((day) => {
                        const dayEvents = getEventsForDate(day);
                        const isSelected = selectedDate && isSameDay(day, selectedDate);
                        const today = isToday(day);

                        return (
                          <DroppableDayWeek
                            key={day.toISOString()}
                            day={day}
                            events={dayEvents}
                            isSelected={!!isSelected}
                            isToday={today}
                            onClick={() => setSelectedDate(day)}
                          />
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Drag Overlay */}
                <DragOverlay>
                  {activeEvent ? (
                    <div className={cn(
                      "text-xs px-2 py-1 rounded text-white shadow-lg",
                      statusColors[activeEvent.installation.status || "project"]
                    )}>
                      {activeEvent.installation.client_name} ({eventTypeLabels[activeEvent.type]})
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's events */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Hoje
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todayEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum evento para hoje</p>
                ) : (
                  <div className="space-y-3">
                    {todayEvents.map((event) => (
                      <div key={event.id} className="flex items-start gap-3 p-2 rounded-lg bg-muted/50">
                        <div className={cn(
                          "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                          statusColors[event.installation.status || "project"]
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{event.installation.client_name}</p>
                          <p className="text-xs text-muted-foreground">{eventTypeLabels[event.type]}</p>
                          {event.installation.city && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" />
                              {event.installation.city}
                            </p>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-[10px]">
                          {statusLabels[event.installation.status || "project"]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Selected date events */}
            {selectedDate && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-primary" />
                    {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedDateEvents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum evento nesta data</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedDateEvents.map((event) => (
                        <div key={event.id} className="p-3 rounded-lg border bg-card">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={cn(
                              "w-3 h-3 rounded-full",
                              statusColors[event.installation.status || "project"]
                            )} />
                            <span className="font-medium text-sm">{event.installation.client_name}</span>
                          </div>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <p>Tipo: {eventTypeLabels[event.type]}</p>
                            {event.installation.address && (
                              <p className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {event.installation.address}
                              </p>
                            )}
                            {event.installation.power_kwp && (
                              <p>Potência: {event.installation.power_kwp} kWp</p>
                            )}
                          </div>
                          <Badge className="mt-2" variant="secondary">
                            {statusLabels[event.installation.status || "project"]}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Status Legend */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Legenda</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <div key={key} className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded-full", statusColors[key])} />
                      <span className="text-sm">{label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

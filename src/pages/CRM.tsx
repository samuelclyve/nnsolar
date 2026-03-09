import { useState, useEffect } from "react";
import { 
  Plus, Search, Filter, Phone, Mail, MapPin, 
  Calendar, GripVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { useWorkspace } from "@/hooks/useWorkspace";
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  closestCenter, PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  city: string | null;
  status: string;
  monthly_consumption: number | null;
  notes: string | null;
  created_at: string;
}

const statusColumns = [
  { id: "new", label: "Novos", color: "bg-blue-500" },
  { id: "contacted", label: "Contatados", color: "bg-yellow-500" },
  { id: "visit_scheduled", label: "Visita Agendada", color: "bg-purple-500" },
  { id: "proposal_sent", label: "Proposta Enviada", color: "bg-orange-500" },
  { id: "negotiation", label: "Negociação", color: "bg-cyan-500" },
  { id: "closed", label: "Fechados", color: "bg-green-500" },
  { id: "lost", label: "Perdidos", color: "bg-red-500" },
];

function DraggableLeadCard({ lead }: { lead: Lead }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead.id, data: lead });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, opacity: isDragging ? 0.5 : 1 } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="bg-background rounded-lg p-3 border border-border hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
          <h4 className="font-medium text-foreground text-sm">{lead.name}</h4>
        </div>
      </div>
      <div className="space-y-1 text-xs text-muted-foreground ml-6">
        <div className="flex items-center gap-1"><Phone className="w-3 h-3" />{lead.phone}</div>
        {lead.city && <div className="flex items-center gap-1"><MapPin className="w-3 h-3" />{lead.city}</div>}
        {lead.email && <div className="flex items-center gap-1"><Mail className="w-3 h-3" />{lead.email}</div>}
      </div>
      <div className="mt-2 pt-2 border-t border-border flex items-center text-xs text-muted-foreground ml-6">
        <div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(lead.created_at).toLocaleDateString("pt-BR")}</div>
      </div>
    </div>
  );
}

function DroppableColumn({ column, leads, children }: { column: typeof statusColumns[0]; leads: Lead[]; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  return (
    <div className="w-72 flex-shrink-0">
      <div className={`bg-card rounded-xl shadow-sm border border-border transition-colors ${isOver ? 'ring-2 ring-primary' : ''}`}>
        <div className="p-4 border-b border-border flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${column.color}`} />
          <h3 className="font-semibold text-foreground">{column.label}</h3>
          <span className="ml-auto bg-muted px-2 py-0.5 rounded-full text-xs text-muted-foreground">{leads.length}</span>
        </div>
        <div ref={setNodeRef} className="p-2 space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto min-h-[100px]">{children}</div>
      </div>
    </div>
  );
}

export default function CRM() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newLead, setNewLead] = useState({ name: "", phone: "", email: "", city: "" });
  const [activeId, setActiveId] = useState<string | null>(null);
  const { toast } = useToast();
  const { workspaceId } = useWorkspace();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => {
    if (workspaceId) fetchLeads();
  }, [workspaceId]);

  useEffect(() => { filterLeads(); }, [leads, searchTerm, statusFilter]);

  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from("leads").select("*")
      .eq("workspace_id", workspaceId!)
      .order("created_at", { ascending: false });
    if (error) { toast({ title: "Erro ao carregar leads", variant: "destructive" }); return; }
    setLeads(data || []);
    setIsLoading(false);
  };

  const filterLeads = () => {
    let filtered = leads;
    if (searchTerm) {
      filtered = filtered.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()) || l.phone.includes(searchTerm) || l.city?.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (statusFilter !== "all") filtered = filtered.filter(l => l.status === statusFilter);
    setFilteredLeads(filtered);
  };

  const createLead = async () => {
    if (!newLead.name || !newLead.phone) { toast({ title: "Preencha nome e telefone", variant: "destructive" }); return; }
    const { error } = await supabase.from("leads").insert({
      name: newLead.name, phone: newLead.phone,
      email: newLead.email || null, city: newLead.city || null,
      workspace_id: workspaceId,
    });
    if (error) { toast({ title: "Erro ao criar lead", variant: "destructive" }); return; }
    toast({ title: "Lead criado com sucesso!" });
    setNewLead({ name: "", phone: "", email: "", city: "" });
    setIsDialogOpen(false);
    fetchLeads();
  };

  const handleDragStart = (event: DragStartEvent) => { setActiveId(event.active.id as string); };
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const leadId = active.id as string;
    const newStatus = over.id as string;
    const lead = leads.find(l => l.id === leadId);
    if (!lead || lead.status === newStatus) return;
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    const { error } = await supabase.from("leads").update({ status: newStatus }).eq("id", leadId);
    if (error) { toast({ title: "Erro ao mover lead", variant: "destructive" }); fetchLeads(); return; }
    toast({ title: `Lead movido para ${statusColumns.find(c => c.id === newStatus)?.label}` });
  };

  const getLeadsByStatus = (status: string) => filteredLeads.filter(l => l.status === status);
  const activeLead = activeId ? leads.find(l => l.id === activeId) : null;

  return (
    <AppLayout title="CRM - Gestão de Leads">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome, telefone ou cidade..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48"><Filter className="w-4 h-4 mr-2" /><SelectValue placeholder="Filtrar por status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {statusColumns.map(col => <SelectItem key={col.id} value={col.id}>{col.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button variant="cta"><Plus className="w-4 h-4" />Novo Lead</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Criar Novo Lead</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div><Label>Nome *</Label><Input value={newLead.name} onChange={(e) => setNewLead({ ...newLead, name: e.target.value })} placeholder="Nome completo" /></div>
              <div><Label>Telefone *</Label><Input value={newLead.phone} onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })} placeholder="(00) 00000-0000" /></div>
              <div><Label>Email</Label><Input value={newLead.email} onChange={(e) => setNewLead({ ...newLead, email: e.target.value })} placeholder="email@exemplo.com" /></div>
              <div><Label>Cidade</Label><Input value={newLead.city} onChange={(e) => setNewLead({ ...newLead, city: e.target.value })} placeholder="Cidade" /></div>
              <Button variant="cta" className="w-full" onClick={createLead}>Criar Lead</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="overflow-x-auto -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8">
          <div className="flex gap-4 min-w-max pb-4">
            {statusColumns.map(column => (
              <DroppableColumn key={column.id} column={column} leads={getLeadsByStatus(column.id)}>
                {getLeadsByStatus(column.id).map(lead => <DraggableLeadCard key={lead.id} lead={lead} />)}
                {getLeadsByStatus(column.id).length === 0 && <p className="text-center text-sm text-muted-foreground py-8">Arraste leads aqui</p>}
              </DroppableColumn>
            ))}
          </div>
        </div>
        <DragOverlay>
          {activeLead ? (
            <div className="bg-background rounded-lg p-3 border-2 border-primary shadow-lg">
              <h4 className="font-medium text-foreground text-sm">{activeLead.name}</h4>
              <p className="text-xs text-muted-foreground">{activeLead.phone}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </AppLayout>
  );
}

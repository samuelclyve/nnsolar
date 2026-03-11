import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircleQuestion, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";

interface Message {
  id: string;
  text: string;
  from: "user" | "system";
  timestamp: Date;
}

export function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Olá! 👋 Como podemos ajudar? Envie sua mensagem e nossa equipe responderá em breve.",
      from: "system",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { workspaceId } = useWorkspace();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUserId(session.user.id);
    });
  }, []);

  // Load previous messages when chat opens
  useEffect(() => {
    if (isOpen && userId && !loaded) {
      loadMessages();
    }
  }, [isOpen, userId]);

  const loadMessages = async () => {
    const { data } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("user_id", userId!)
      .order("created_at", { ascending: true });

    if (data && data.length > 0) {
      const loaded: Message[] = data.map((t: any) => ({
        id: t.id,
        text: t.message,
        from: t.sender as "user" | "system",
        timestamp: new Date(t.created_at),
      }));
      setMessages((prev) => [prev[0], ...loaded]);
    }
    setLoaded(true);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !userId) return;

    const text = input.trim();
    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      from: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Persist user message
    await supabase.from("support_tickets").insert({
      user_id: userId,
      workspace_id: workspaceId,
      message: text,
      sender: "user",
    });

    // Auto-reply after short delay
    setTimeout(async () => {
      const replyText = "Obrigado pelo contato! Nossa equipe em breve entrará em contato. 😊";
      const autoReply: Message = {
        id: (Date.now() + 1).toString(),
        text: replyText,
        from: "system",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, autoReply]);

      // Persist auto-reply
      await supabase.from("support_tickets").insert({
        user_id: userId,
        workspace_id: workspaceId,
        message: replyText,
        sender: "system",
      });
    }, 800);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full w-10 h-10 text-muted-foreground hover:text-foreground relative"
        title="Suporte"
      >
        <MessageCircleQuestion className="w-5 h-5" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 right-4 z-50 w-80 md:w-96 bg-card rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden"
            style={{ maxHeight: "calc(100vh - 5rem)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
              <div>
                <p className="font-semibold text-sm">Suporte Solarize</p>
                <p className="text-xs opacity-80">Estamos aqui para ajudar</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-primary-foreground/20 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[250px] max-h-[400px]">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                      msg.from === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 rounded-xl h-9 text-sm"
                />
                <Button type="submit" size="icon" className="rounded-xl h-9 w-9 flex-shrink-0 bg-primary text-primary-foreground">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

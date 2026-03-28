import { AnimatedSection } from "@/components/AnimatedSection";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentProject } from "@/store/projectStore";
import { generateChatResponse } from "@/lib/riskEngine";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIAssistant() {
  const project = useCurrentProject();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: `Hello! I'm your BuildWise AI Assistant analyzing **${project.name}**.\n\nI use real-time project data to provide context-aware analysis. Ask me about:\n- **Delays** — schedule analysis with CPM\n- **Costs** — budget variance tracking\n- **Risks** — 8-factor risk breakdown\n- **Resources** — worker allocation\n- **Recommendations** — corrective actions` },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      const response = generateChatResponse(
        userMsg.content,
        project.tasks,
        project.riskBreakdown,
        project.delayPrediction,
        project.name,
        project.totalBudget,
      );
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      setLoading(false);
    }, 400 + Math.random() * 400);
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <AnimatedSection>
        <h1 className="page-header">AI Chat Assistant</h1>
        <p className="page-subheader mb-4">Context-aware analysis for {project.name}</p>
      </AnimatedSection>

      <div className="flex-1 section-card flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}>
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none [&_table]:text-xs [&_th]:p-1.5 [&_td]:p-1.5">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 text-accent-foreground" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <div className="bg-muted rounded-xl px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t p-3 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask about delays, costs, risks, resources..."
            className="flex-1"
          />
          <Button onClick={send} disabled={!input.trim() || loading} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <div className="px-3 pb-3 flex gap-2 flex-wrap">
          {["Why is my project delayed?", "Show risk breakdown", "How is my budget?", "What should I do?", "Resource status"].map((q) => (
            <button
              key={q}
              onClick={() => { setInput(q); }}
              className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-muted transition-colors text-muted-foreground"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

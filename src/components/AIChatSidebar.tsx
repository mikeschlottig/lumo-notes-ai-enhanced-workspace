import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Loader2, User, Bot, Trash2, Wand2, AlignLeft, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatService, formatTime } from '@/lib/chat';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Message } from '../../worker/types';
interface AIChatSidebarProps {
  id: string;
}
const QUICK_ACTIONS = [
  { icon: <AlignLeft className="h-3 w-3" />, label: "Summarize", prompt: "Please provide a concise summary of this document." },
  { icon: <CheckCircle2 className="h-3 w-3" />, label: "Fix Grammar", prompt: "Review the document and suggest grammar and spelling improvements." },
  { icon: <Wand2 className="h-3 w-3" />, label: "Simplify", prompt: "Explain the main points of this document in simple terms." },
];
export function AIChatSidebar({ id }: AIChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatService.switchSession(id);
    loadMessages();
  }, [id]);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingContent]);
  const loadMessages = async () => {
    const res = await chatService.getMessages();
    if (res.success && res.data) {
      setMessages(res.data.messages);
    }
  };
  const handleSend = async (customPrompt?: string) => {
    const content = customPrompt || input;
    if (!content.trim() || isTyping) return;
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMessage]);
    if (!customPrompt) setInput('');
    setIsTyping(true);
    setStreamingContent('');
    try {
      await chatService.sendMessage(userMessage.content, undefined, (chunk) => {
        setStreamingContent(prev => prev + chunk);
      });
      await loadMessages();
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
      setStreamingContent('');
    }
  };
  const clearChat = async () => {
    await chatService.clearMessages();
    setMessages([]);
  };
  return (
    <aside className="w-80 border-l border-border/40 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-xl flex flex-col animate-in slide-in-from-right duration-500 ease-in-out">
      <div className="p-4 border-b bg-background/50 flex items-center justify-between">
        <span className="text-sm font-bold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          Lumo Assistant
        </span>
        <Button variant="ghost" size="icon" onClick={clearChat} className="h-8 w-8 text-muted-foreground hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-3 border-b flex gap-2 overflow-x-auto no-scrollbar">
        {QUICK_ACTIONS.map((action) => (
          <Button 
            key={action.label} 
            variant="outline" 
            size="sm" 
            className="h-7 text-[10px] gap-1.5 shrink-0 bg-background/50"
            onClick={() => handleSend(action.prompt)}
            disabled={isTyping}
          >
            {action.icon}
            {action.label}
          </Button>
        ))}
      </div>
      <ScrollArea className="flex-1 px-4 py-6">
        <div className="space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-zinc-200 dark:bg-zinc-800' : 'bg-primary text-primary-foreground'}`}>
                  {msg.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </div>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm leading-relaxed ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background border border-border/40'}`}>
                  {msg.content}
                  <div className="mt-1 text-[9px] font-medium opacity-40 uppercase tracking-tighter">{formatTime(msg.timestamp)}</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {(isTyping || streamingContent) && (
            <div className="flex gap-3">
              <div className="h-7 w-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm bg-background border border-border/40 shadow-sm min-h-[40px] flex items-center">
                {streamingContent || (
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full animate-bounce" />
                  </div>
                )}
              </div>
            </div>
          )}
          <div ref={scrollRef} className="h-4" />
        </div>
      </ScrollArea>
      <div className="p-4 border-t bg-background/50">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative flex items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI a question..."
            className="pr-10 bg-secondary/30 border-none h-11 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl"
            disabled={isTyping}
          />
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            disabled={!input.trim() || isTyping}
            className="absolute right-1.5 top-1.5 h-8 w-8 hover:bg-primary hover:text-primary-foreground transition-all duration-300 rounded-lg"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="mt-3 text-[9px] text-center text-muted-foreground/40 font-bold uppercase tracking-widest">
          Document Intelligence Active
        </p>
      </div>
    </aside>
  );
}
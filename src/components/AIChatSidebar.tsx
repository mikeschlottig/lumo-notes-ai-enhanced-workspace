import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Loader2, User, Bot, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatService, formatTime } from '@/lib/chat';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Message } from '../../worker/types';
interface AIChatSidebarProps {
  id: string;
}
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
  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
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
    <aside className="w-80 border-l border-border/40 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="p-4 border-b bg-background/50 flex items-center justify-between">
        <span className="text-sm font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Assistant
        </span>
        <Button variant="ghost" size="icon" onClick={clearChat} className="h-8 w-8 text-muted-foreground hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-zinc-200 dark:bg-zinc-800' : 'bg-primary text-primary-foreground'}`}>
                  {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background border border-border/40'}`}>
                  {msg.content}
                  <div className="mt-1 text-[10px] opacity-50">{formatTime(msg.timestamp)}</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {(isTyping || streamingContent) && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="max-w-[80%] rounded-2xl px-3 py-2 text-sm bg-background border border-border/40">
                {streamingContent || <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
            </div>
          )}
          <div ref={scrollRef} />
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
            placeholder="Ask anything..."
            className="pr-10 bg-secondary/30 border-none h-10"
            disabled={isTyping}
          />
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            disabled={!input.trim() || isTyping}
            className="absolute right-1 top-1 h-8 w-8 hover:bg-primary hover:text-primary-foreground"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="mt-2 text-[10px] text-center text-muted-foreground/60">
          AI can see the current document content.
        </p>
      </div>
    </aside>
  );
}
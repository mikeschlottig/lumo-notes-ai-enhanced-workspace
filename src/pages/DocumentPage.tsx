import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AppSidebar } from '@/components/app-sidebar';
import { Editor } from '@/components/editor/Editor';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useDocumentStore } from '@/store/use-document-store';
import { Sparkles, PanelRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
export function DocumentPage() {
  const { id } = useParams();
  const setDoc = useDocumentStore(s => s.setCurrentDocument);
  const isAiOpen = useDocumentStore(s => s.isAiPanelOpen);
  const toggleAi = useDocumentStore(s => s.toggleAiPanel);
  const currentDoc = useDocumentStore(s => s.currentDocument);
  useEffect(() => {
    if (id) setDoc(id);
  }, [id, setDoc]);
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="relative flex h-screen overflow-hidden bg-background">
        <header className="flex h-12 items-center justify-between border-b px-4 border-border/40">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-1" />
            <div className="h-4 w-[1px] bg-border/60 mx-1" />
            <span className="text-xs font-medium text-muted-foreground truncate max-w-[200px]">
              {currentDoc?.title || "Untitled Page"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle className="static" />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleAi} 
              className={`gap-2 ${isAiOpen ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`}
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Ask AI</span>
            </Button>
            <div className="h-4 w-[1px] bg-border/60 mx-1" />
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <PanelRight className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <Editor />
        </main>
        {/* AI Sidebar Placeholder - To be implemented in Phase 2 */}
        {isAiOpen && (
          <aside className="w-80 border-l border-border/40 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b bg-background/50 flex items-center justify-between">
              <span className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Assistant
              </span>
              <Button variant="ghost" size="icon" onClick={toggleAi}>
                <span className="sr-only">Close</span>
                ×
              </Button>
            </div>
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Sparkles className="h-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">AI Assistant Coming Soon</h3>
                <p className="text-xs text-muted-foreground mt-1 px-4">
                  In Phase 2, this sidepanel will let you chat with your document, summarize content, and generate blocks.
                </p>
              </div>
            </div>
          </aside>
        )}
        <div className="fixed bottom-4 right-4 text-[10px] text-muted-foreground/40 pointer-events-none">
          Lumo v1.0 • Phase 1 Core
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
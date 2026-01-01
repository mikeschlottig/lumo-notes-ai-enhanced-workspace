import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AppSidebar } from '@/components/app-sidebar';
import { Editor } from '@/components/editor/Editor';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useDocumentStore } from '@/store/use-document-store';
import { Sparkles, PanelRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AIChatSidebar } from '@/components/AIChatSidebar';
export function DocumentPage() {
  const { id } = useParams();
  const setDoc = useDocumentStore(s => s.setCurrentDocument);
  const isAiOpen = useDocumentStore(s => s.isAiPanelOpen);
  const toggleAi = useDocumentStore(s => s.toggleAiPanel);
  const currentDocTitle = useDocumentStore(s => s.currentDocument?.title);
  useEffect(() => {
    if (id) {
      setDoc(id);
    }
  }, [id, setDoc]);
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="relative flex h-screen overflow-hidden bg-background">
        <header className="flex h-12 items-center justify-between border-b px-4 border-border/40 shrink-0">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-1" />
            <div className="h-4 w-[1px] bg-border/60 mx-1" />
            <span className="text-xs font-medium text-muted-foreground truncate max-w-[200px]">
              {currentDocTitle || "Untitled Page"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle className="static" />
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAi}
              className={`gap-2 transition-colors ${isAiOpen ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
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
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto custom-scrollbar">
            <Editor />
          </main>
          {isAiOpen && id && (
            <AIChatSidebar id={id} />
          )}
        </div>
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground/40 pointer-events-none bg-background/50 backdrop-blur px-2 py-1 rounded-full border border-border/20">
          Lumo v1.0 • Document-Aware AI Active
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { AppSidebar } from '@/components/app-sidebar';
import { Editor } from '@/components/editor/Editor';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useDocumentStore } from '@/store/use-document-store';
import { Sparkles, PanelRight, Star, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AIChatSidebar } from '@/components/AIChatSidebar';
export function DocumentPage() {
  const { id } = useParams();
  const setDoc = useDocumentStore(s => s.setCurrentDocument);
  const isAiOpen = useDocumentStore(s => s.isAiPanelOpen);
  const toggleAi = useDocumentStore(s => s.toggleAiPanel);
  const currentDoc = useDocumentStore(s => s.currentDocument);
  const updateDoc = useDocumentStore(s => s.updateCurrentDocument);
  useEffect(() => {
    if (id) {
      setDoc(id);
    }
  }, [id, setDoc]);
  const wordCount = useMemo(() => {
    if (!currentDoc?.content) return 0;
    const text = currentDoc.content.replace(/<[^>]*>/g, ' ');
    return text.split(/\s+/).filter(Boolean).length;
  }, [currentDoc?.content]);
  const readTime = Math.ceil(wordCount / 200);
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="relative flex h-screen overflow-hidden bg-background">
        <header className="flex h-14 items-center justify-between border-b px-4 border-border/40 shrink-0 bg-background/50 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="-ml-1 h-8 w-8" />
            <div className="h-4 w-[1px] bg-border/40 mx-1" />
            <nav className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span>Private</span>
              <span>/</span>
              <span className="text-foreground truncate max-w-[150px] md:max-w-[300px]">
                {currentDoc?.title || "Untitled"}
              </span>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 transition-colors ${currentDoc?.isFavorite ? 'text-yellow-500 hover:text-yellow-600' : 'text-muted-foreground'}`}
              onClick={() => updateDoc({ isFavorite: !currentDoc?.isFavorite })}
            >
              <Star className={`h-4 w-4 ${currentDoc?.isFavorite ? 'fill-current' : ''}`} />
            </Button>
            <div className="h-4 w-[1px] bg-border/40 mx-1" />
            <ThemeToggle className="static" />
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleAi}
              className={`h-8 gap-2 rounded-full transition-all duration-300 ${isAiOpen ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-secondary text-muted-foreground'}`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-[11px] font-bold uppercase tracking-wider">Assistant</span>
            </Button>
            <div className="h-4 w-[1px] bg-border/40 mx-1" />
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <PanelRight className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto custom-scrollbar bg-background selection:bg-primary/10">
            <Editor />
          </main>
          {isAiOpen && id && (
            <AIChatSidebar id={id} />
          )}
        </div>
        <footer className="h-8 border-t bg-background/50 backdrop-blur-sm px-4 flex items-center justify-between text-[10px] text-muted-foreground/60 font-medium z-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <FileText className="h-3 w-3" />
              {wordCount} words
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              {readTime} min read
            </div>
          </div>
          <div className="flex items-center gap-2 opacity-50">
            Lumo v1.0 • Block Engine Active
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
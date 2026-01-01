import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocumentStore } from '@/store/use-document-store';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Button } from '@/components/ui/button';
import { Sparkles, PlusCircle, Layout } from 'lucide-react';
export function HomePage() {
  const navigate = useNavigate();
  const documents = useDocumentStore(s => s.documents);
  const fetchDocs = useDocumentStore(s => s.fetchDocuments);
  const createDoc = useDocumentStore(s => s.createDocument);
  useEffect(() => {
    fetchDocs().then(() => {
      // If user has docs, we could auto-redirect, but a landing is nicer
      // for the "Empty state" feel.
    });
  }, [fetchDocs]);
  const handleCreate = async () => {
    const id = await createDoc();
    navigate(`/doc/${id}`);
  };
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="flex flex-col bg-background h-screen overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8 animate-fade-in">
          <div className="space-y-4 max-w-md">
            <div className="mx-auto w-16 h-16 rounded-3xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 floating">
              <Layout className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Welcome to Lumo</h1>
            <p className="text-muted-foreground">
              Your minimalist, AI-powered workspace. Capture thoughts, structure knowledge, and collaborate with intelligence.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" onClick={handleCreate} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Create New Page
            </Button>
            <Button size="lg" variant="outline" className="gap-2" onClick={() => documents[0] && navigate(`/doc/${documents[0].id}`)} disabled={documents.length === 0}>
              Open Recent
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl pt-12">
            {[
              { icon: <Sparkles className="h-5 w-5" />, title: "AI Integrated", text: "Chat with your docs directly." },
              { icon: <FileText className="h-5 w-5" />, title: "Block Editor", text: "Rich formatting made simple." },
              { icon: <Layout className="h-5 w-5" />, title: "Always Ready", text: "Synced instantly via Edge DOs." }
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl border bg-card/50 text-left space-y-2">
                <div className="text-primary">{feature.icon}</div>
                <h3 className="font-semibold text-sm">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
        <footer className="p-8 border-t bg-muted/30 text-center">
          <p className="text-xs text-muted-foreground">
            Lumo Notes - Experimental AI Workspace. Limit: 10 requests/min per session.
          </p>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
// Minimal icons for local usage if not imported elsewhere
function FileText(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
}
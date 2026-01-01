import React, { useEffect } from "react";
import { Plus, FileText, Settings, Trash2, Search } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useDocumentStore } from "@/store/use-document-store";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInput,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
} from "@/components/ui/sidebar";
export function AppSidebar(): JSX.Element {
  const navigate = useNavigate();
  const { id: activeId } = useParams();
  const documents = useDocumentStore(s => s.documents);
  const fetchDocs = useDocumentStore(s => s.fetchDocuments);
  const createDoc = useDocumentStore(s => s.createDocument);
  const deleteDoc = useDocumentStore(s => s.deleteDocument);
  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);
  const handleNewPage = async () => {
    const id = await createDoc();
    navigate(`/doc/${id}`);
  };
  return (
    <Sidebar className="border-r border-border/40">
      <SidebarHeader className="p-4 space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs">L</span>
          </div>
          <span className="text-sm font-semibold tracking-tight">Lumo Notes</span>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <SidebarInput placeholder="Search pages..." className="pl-9 h-9 bg-secondary/50 border-none" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleNewPage} className="text-primary">
                <Plus className="h-4 w-4" />
                <span>New Page</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
            Private
          </SidebarGroupLabel>
          <SidebarMenu className="px-2">
            {documents.map((doc) => (
              <SidebarMenuItem key={doc.id}>
                <SidebarMenuButton
                  isActive={activeId === doc.id}
                  onClick={() => navigate(`/doc/${doc.id}`)}
                  className="group"
                >
                  <FileText className="h-4 w-4 opacity-50" />
                  <span className="truncate">{doc.title || "Untitled"}</span>
                </SidebarMenuButton>
                <SidebarMenuAction 
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => deleteDoc(doc.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                </SidebarMenuAction>
              </SidebarMenuItem>
            ))}
            {documents.length === 0 && (
              <div className="px-4 py-2 text-xs text-muted-foreground/60">
                No pages yet
              </div>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-border/40">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="text-muted-foreground hover:text-foreground">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-muted-foreground/40 font-medium">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          ONLINE AT EDGE
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
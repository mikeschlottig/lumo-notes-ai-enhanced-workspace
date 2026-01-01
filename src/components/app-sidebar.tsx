import React, { useEffect, useState, useMemo } from "react";
import { Plus, FileText, Settings, Trash2, Search, Star, MoreVertical } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
export function AppSidebar(): JSX.Element {
  const navigate = useNavigate();
  const { id: activeId } = useParams();
  const documents = useDocumentStore(s => s.documents);
  const fetchDocs = useDocumentStore(s => s.fetchDocuments);
  const createDoc = useDocumentStore(s => s.createDocument);
  const deleteDoc = useDocumentStore(s => s.deleteDocument);
  const [search, setSearch] = useState("");
  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);
  const filteredDocs = useMemo(() => {
    if (!search) return documents;
    return documents.filter(d => d.title.toLowerCase().includes(search.toLowerCase()));
  }, [documents, search]);
  const favorites = useMemo(() => filteredDocs.slice(0, 2), [filteredDocs]); // Mocking favorites for Phase 3
  const handleNewPage = async () => {
    const id = await createDoc();
    navigate(`/doc/${id}`);
  };
  return (
    <Sidebar className="border-r border-border/40">
      <SidebarHeader className="p-4 space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="h-6 w-6 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-[10px]">L</span>
          </div>
          <span className="text-sm font-semibold tracking-tight">Lumo Workspace</span>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/50" />
          <SidebarInput 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..." 
            className="pl-9 h-9 bg-secondary/50 border-none ring-offset-background placeholder:text-muted-foreground/50" 
          />
        </div>
      </SidebarHeader>
      <SidebarContent className="custom-scrollbar">
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleNewPage} className="text-primary hover:bg-primary/5">
                <Plus className="h-4 w-4" />
                <span className="font-medium">New Page</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        {favorites.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
              Favorites
            </SidebarGroupLabel>
            <SidebarMenu className="px-2">
              {favorites.map((doc) => (
                <SidebarMenuItem key={doc.id}>
                  <SidebarMenuButton
                    isActive={activeId === doc.id}
                    onClick={() => navigate(`/doc/${doc.id}`)}
                    className="group"
                  >
                    <span className="mr-2 text-xs opacity-70">📄</span>
                    <span className="truncate">{doc.title || "Untitled"}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
            Private
          </SidebarGroupLabel>
          <SidebarMenu className="px-2">
            {filteredDocs.map((doc) => (
              <SidebarMenuItem key={doc.id}>
                <SidebarMenuButton
                  isActive={activeId === doc.id}
                  onClick={() => navigate(`/doc/${doc.id}`)}
                  className="group"
                >
                  <FileText className="h-4 w-4 opacity-50" />
                  <span className="truncate">{doc.title || "Untitled"}</span>
                </SidebarMenuButton>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuAction className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-3.5 w-3.5" />
                    </SidebarMenuAction>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem className="gap-2">
                      <Star className="h-3.5 w-3.5" /> Favorite
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="gap-2 text-destructive focus:text-destructive"
                      onClick={() => deleteDoc(doc.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            ))}
            {filteredDocs.length === 0 && (
              <div className="px-4 py-2 text-xs text-muted-foreground/60">
                {search ? "No matches found" : "No pages yet"}
              </div>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-border/40 bg-zinc-50/50 dark:bg-zinc-900/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="text-muted-foreground hover:text-foreground">
              <Settings className="h-4 w-4" />
              <span>Workspace Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-muted-foreground/30 font-bold tracking-tighter uppercase">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          Cloudflare Edge Connected
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
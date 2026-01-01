import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Link from '@tiptap/extension-link';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { all, createLowlight } from 'lowlight';
import { useDocumentStore } from '@/store/use-document-store';
import { useDebounce } from 'react-use';
import { SlashCommand } from './extensions/slash-command';
import { ImagePlus, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
const lowlight = createLowlight(all);
export function Editor() {
  const content = useDocumentStore(s => s.currentDocument?.content);
  const title = useDocumentStore(s => s.currentDocument?.title);
  const updateDoc = useDocumentStore(s => s.updateCurrentDocument);
  const [showCoverActions, setShowCoverActions] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Typography,
      Placeholder.configure({
        placeholder: "Type '/' for commands...",
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      SlashCommand,
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-zinc dark:prose-invert max-w-none focus:outline-none min-h-[500px] pb-32 px-4 md:px-0',
      },
    },
  });
  useEffect(() => {
    if (editor && content !== undefined && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);
  useDebounce(
    () => {
      if (editor) {
        const html = editor.getHTML();
        if (html !== content) {
          updateDoc({ content: html });
        }
      }
    },
    1000,
    [editor?.getHTML()]
  );
  if (!editor) return null;
  return (
    <div className="w-full max-w-4xl mx-auto pb-12 relative">
      <div 
        className="group relative h-[250px] w-full bg-gradient-to-r from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900 overflow-hidden md:rounded-b-2xl mb-12"
        onMouseEnter={() => setShowCoverActions(true)}
        onMouseLeave={() => setShowCoverActions(false)}
      >
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        {showCoverActions && (
          <div className="absolute bottom-4 right-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <Button variant="secondary" size="sm" className="bg-background/80 backdrop-blur-sm border-none shadow-sm gap-2">
              <ImagePlus className="h-4 w-4" />
              Change Cover
            </Button>
          </div>
        )}
      </div>
      <div className="px-4 md:px-0 -mt-16 relative z-10 mb-8 space-y-4">
        <Popover>
          <PopoverTrigger asChild>
            <button className="h-20 w-20 rounded-2xl bg-background border-4 border-background shadow-lg hover:scale-105 transition-transform flex items-center justify-center text-4xl">
              📄
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2">
            <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Select Icon</div>
            <div className="grid grid-cols-6 gap-1">
              {['📄', '📝', '💡', '🚀', '🔥', '⭐️', '🎯', '🌈', '��', '💼', '🏡', '🌍'].map(emoji => (
                <button key={emoji} className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded text-lg">
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <input
          type="text"
          value={title || ''}
          onChange={(e) => updateDoc({ title: e.target.value })}
          className="w-full text-5xl font-bold bg-transparent border-none focus:ring-0 placeholder:text-muted-foreground/20 leading-tight"
          placeholder="Untitled Page"
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
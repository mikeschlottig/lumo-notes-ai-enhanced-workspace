import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Link from '@tiptap/extension-link';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { useDocumentStore } from '@/store/use-document-store';
import { useDebounce } from 'react-use';
import { SlashCommand } from './extensions/slash-command';
const lowlight = createLowlight(common);
export function Editor() {
  const content = useDocumentStore(s => s.currentDocument?.content);
  const title = useDocumentStore(s => s.currentDocument?.title);
  const updateDoc = useDocumentStore(s => s.updateCurrentDocument);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Replaced by CodeBlockLowlight
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
        class: 'prose prose-zinc dark:prose-invert max-w-none focus:outline-none min-h-[500px] pb-32',
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
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <input
          type="text"
          value={title || ''}
          onChange={(e) => updateDoc({ title: e.target.value })}
          className="w-full text-4xl font-bold bg-transparent border-none focus:ring-0 placeholder:text-muted-foreground/30"
          placeholder="Untitled Page"
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
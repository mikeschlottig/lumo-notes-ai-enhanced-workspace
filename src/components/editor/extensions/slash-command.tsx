import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Editor, Range, Extension } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import Suggestion from '@tiptap/suggestion';
import {
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code,
  Type, CheckSquare
} from 'lucide-react';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList
} from '@/components/ui/command';
const CommandListRenderer = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectItem = useCallback((index: number) => {
    const item = props.items[index];
    if (item) props.command(item);
  }, [props]);
  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
        return true;
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));
  useEffect(() => setSelectedIndex(0), [props.items]);
  if (!props.items.length) return null;
  return (
    <div className="z-50 min-w-[200px] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
      <CommandList>
        <CommandGroup heading="Blocks">
          {props.items.map((item: any, index: number) => (
            <CommandItem
              key={index}
              onSelect={() => selectItem(index)}
              className={`flex items-center gap-2 px-2 py-1 text-sm cursor-pointer ${selectedIndex === index ? 'bg-accent text-accent-foreground' : ''}`}
            >
              <div className="flex h-6 w-6 items-center justify-center rounded border bg-background">
                {item.icon}
              </div>
              <span>{item.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </div>
  );
});
CommandListRenderer.displayName = 'CommandListRenderer';
export const SlashCommand = Extension.create({
  name: 'slashCommand',
  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: { editor: Editor; range: Range; props: any }) => {
          props.command({ editor, range });
        },
      },
    };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        items: ({ query }: { query: string }) => {
          return [
            {
              title: 'Text',
              icon: <Type className="w-3 h-3" />,
              command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).setNode('paragraph').run();
              },
            },
            {
              title: 'Heading 1',
              icon: <Heading1 className="w-3 h-3" />,
              command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
              },
            },
            {
              title: 'Heading 2',
              icon: <Heading2 className="w-3 h-3" />,
              command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
              },
            },
            {
              title: 'Heading 3',
              icon: <Heading3 className="w-3 h-3" />,
              command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run();
              },
            },
            {
              title: 'Bullet List',
              icon: <List className="w-3 h-3" />,
              command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).toggleBulletList().run();
              },
            },
            {
              title: 'Numbered List',
              icon: <ListOrdered className="w-3 h-3" />,
              command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).toggleOrderedList().run();
              },
            },
            {
              title: 'Quote',
              icon: <Quote className="w-3 h-3" />,
              command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).toggleBlockquote().run();
              },
            },
            {
              title: 'Code Block',
              icon: <Code className="w-3 h-3" />,
              command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
              },
            },
          ].filter(item => item.title.toLowerCase().startsWith(query.toLowerCase()));
        },
        render: () => {
          let component: any;
          return {
            onStart: (props: any) => {
              component = new ReactRenderer(CommandListRenderer, {
                props,
                editor: props.editor,
              });
            },
            onUpdate(props: any) {
              component.updateProps(props);
            },
            onKeyDown(props: any) {
              if (props.event.key === 'Escape') {
                return true;
              }
              return component.ref?.onKeyDown(props);
            },
            onExit() {
              component.destroy();
            },
          };
        },
      }),
    ];
  },
});
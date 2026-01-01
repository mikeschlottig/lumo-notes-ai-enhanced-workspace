import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Editor, Range, Extension } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import Suggestion from '@tiptap/suggestion';
import {
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code,
  Type, CheckSquare
} from 'lucide-react';

const CommandListRenderer = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectItem = useCallback((index: number) => {
    const item = props.items[index];
    if (item) props.command(item);
  }, [props.items?.length]);
  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (!props.items?.length) return false;
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
      <div className="max-h-[300px] overflow-y-auto overflow-x-hidden">
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground mb-2">
          Blocks
        </div>
        {props.items.map((item: any, index: number) => (
          <div
            key={index}
            role="option"
            aria-selected={selectedIndex === index}
            className={`relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${selectedIndex === index ? 'bg-accent text-accent-foreground' : ''}`}
            onClick={() => selectItem(index)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <div className="flex h-6 w-6 items-center justify-center rounded border bg-background">
              {item.icon}
            </div>
            <span>{item.title}</span>
          </div>
        ))}
      </div>
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
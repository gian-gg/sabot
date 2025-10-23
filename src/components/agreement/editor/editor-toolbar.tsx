'use client';

import { type Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Quote,
  Undo,
  Redo,
  FileSignature,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditorToolbarProps {
  editor: Editor | null;
  onInsertSignature?: () => void;
}

export function EditorToolbar({
  editor,
  onInsertSignature,
}: EditorToolbarProps) {
  if (!editor) return null;

  const ToolbarButton = ({
    onClick,
    active,
    disabled,
    children,
    title,
  }: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn('h-8 w-8 p-0', active && 'bg-primary/20 text-primary')}
    >
      {children}
    </Button>
  );

  return (
    <div className="border-border shrink-0 border-t px-4 py-2 backdrop-blur-sm">
      <div className="flex max-w-xl gap-52">
        {/* Text Formatting */}
        <div className="flex flex-row">
          <div className="border-border mr-2 flex items-center gap-1 border-r pr-2">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive('bold')}
              title="Bold (Ctrl+B)"
            >
              <Bold className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive('italic')}
              title="Italic (Ctrl+I)"
            >
              <Italic className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              active={editor.isActive('underline')}
              title="Underline (Ctrl+U)"
            >
              <Underline className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              active={editor.isActive('strike')}
              title="Strikethrough"
            >
              <Strikethrough className="h-4 w-4" />
            </ToolbarButton>
          </div>

          {/* Headings */}
          <div className="border-border mr-2 flex items-center gap-1 border-r pr-2">
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              active={editor.isActive('heading', { level: 1 })}
              title="Heading 1"
            >
              <Heading1 className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              active={editor.isActive('heading', { level: 2 })}
              title="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              active={editor.isActive('heading', { level: 3 })}
              title="Heading 3"
            >
              <Heading3 className="h-4 w-4" />
            </ToolbarButton>
          </div>

          {/* Lists */}
          <div className="border-border mr-2 flex items-center gap-1 border-r pr-2">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive('bulletList')}
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive('orderedList')}
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
          </div>

          {/* Code & Quote */}
          <div className="border-border mr-2 flex items-center gap-1 border-r pr-2">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              active={editor.isActive('code')}
              title="Code"
            >
              <Code className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive('blockquote')}
              title="Blockquote"
            >
              <Quote className="h-4 w-4" />
            </ToolbarButton>
          </div>
        </div>

        <div className="right-0 left-0 flex flex-row">
          {/* Undo/Redo */}
          <div className="border-border mr-2 flex items-center gap-1 border-r pr-2">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Undo (Ctrl+Z)"
            >
              <Undo className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Redo (Ctrl+Y)"
            >
              <Redo className="h-4 w-4" />
            </ToolbarButton>
          </div>

          {/* Insert Signature */}
          <Button
            variant="outline"
            size="sm"
            onClick={onInsertSignature}
            className="h-8 gap-2"
            title="Insert Signature Block"
          >
            <FileSignature className="h-4 w-4" />
            <span className="text-xs">Insert Signature</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

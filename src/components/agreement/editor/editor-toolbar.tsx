'use client';

import Quill from 'quill';
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
import { useEffect, useState } from 'react';

interface EditorToolbarProps {
  quill: Quill | null;
  onInsertSignature?: () => void;
}

export function EditorToolbar({
  quill,
  onInsertSignature,
}: EditorToolbarProps) {
  const [formattings, setFormattings] = useState({
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    h1: false,
    h2: false,
    h3: false,
    list: false,
    ordered: false,
    code: false,
    blockquote: false,
  });

  // Listen for selection changes to update toolbar state
  useEffect(() => {
    if (!quill) return;

    const updateFormats = () => {
      const selection = quill.getSelection();
      if (selection && selection.length > 0) {
        const formats = quill.getFormat(selection.index, selection.length);
        setFormattings({
          bold: !!formats.bold,
          italic: !!formats.italic,
          underline: !!formats.underline,
          strike: !!formats.strike,
          h1: formats.header === 1,
          h2: formats.header === 2,
          h3: formats.header === 3,
          list: formats.list === 'bullet',
          ordered: formats.list === 'ordered',
          code: !!formats.code,
          blockquote: !!formats.blockquote,
        });
      }
    };

    quill.on('selection-change', updateFormats);
    return () => {
      quill.off('selection-change', updateFormats);
    };
  }, [quill]);

  if (!quill) return null;

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

  const toggleFormat = (
    format: string,
    value: boolean | string | number = true
  ) => {
    const selection = quill.getSelection();
    if (selection && selection.length > 0) {
      quill.formatText(selection.index, selection.length, format, value);
      quill.focus();
    }
  };

  return (
    <div className="border-border shrink-0 border-t px-4 py-2 backdrop-blur-sm">
      <div className="flex max-w-xl gap-52">
        {/* Text Formatting */}
        <div className="flex flex-row">
          <div className="border-border mr-2 flex items-center gap-1 border-r pr-2">
            <ToolbarButton
              onClick={() => toggleFormat('bold')}
              active={formattings.bold}
              title="Bold (Ctrl+B)"
            >
              <Bold className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => toggleFormat('italic')}
              active={formattings.italic}
              title="Italic (Ctrl+I)"
            >
              <Italic className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => toggleFormat('underline')}
              active={formattings.underline}
              title="Underline (Ctrl+U)"
            >
              <Underline className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => toggleFormat('strike')}
              active={formattings.strike}
              title="Strikethrough"
            >
              <Strikethrough className="h-4 w-4" />
            </ToolbarButton>
          </div>

          {/* Headings */}
          <div className="border-border mr-2 flex items-center gap-1 border-r pr-2">
            <ToolbarButton
              onClick={() => toggleFormat('header', formattings.h1 ? false : 1)}
              active={formattings.h1}
              title="Heading 1"
            >
              <Heading1 className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => toggleFormat('header', formattings.h2 ? false : 2)}
              active={formattings.h2}
              title="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => toggleFormat('header', formattings.h3 ? false : 3)}
              active={formattings.h3}
              title="Heading 3"
            >
              <Heading3 className="h-4 w-4" />
            </ToolbarButton>
          </div>

          {/* Lists */}
          <div className="border-border mr-2 flex items-center gap-1 border-r pr-2">
            <ToolbarButton
              onClick={() =>
                toggleFormat('list', formattings.list ? false : 'bullet')
              }
              active={formattings.list}
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() =>
                toggleFormat('list', formattings.ordered ? false : 'ordered')
              }
              active={formattings.ordered}
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
          </div>

          {/* Code & Quote */}
          <div className="border-border mr-2 flex items-center gap-1 border-r pr-2">
            <ToolbarButton
              onClick={() => toggleFormat('code')}
              active={formattings.code}
              title="Code"
            >
              <Code className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => toggleFormat('blockquote')}
              active={formattings.blockquote}
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
              onClick={() => quill.history.undo()}
              title="Undo (Ctrl+Z)"
            >
              <Undo className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => quill.history.redo()}
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

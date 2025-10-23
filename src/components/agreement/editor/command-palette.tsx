'use client';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { FileText, Sparkles, Save, Download, CheckCircle2 } from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport?: () => void;
  onSave?: () => void;
  onAICheck?: () => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  onExport,
  onSave,
  onAICheck,
}: CommandPaletteProps) {
  const handleSelect = (callback?: () => void) => {
    callback?.();
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Document Actions">
          <CommandItem onSelect={() => handleSelect(onSave)}>
            <Save className="mr-2 h-4 w-4" />
            <span>Save Document</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(onExport)}>
            <Download className="mr-2 h-4 w-4" />
            <span>Export as PDF</span>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="AI & Analysis">
          <CommandItem onSelect={() => handleSelect(onAICheck)}>
            <Sparkles className="mr-2 h-4 w-4" />
            <span>Run AI Check</span>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Workflow">
          <CommandItem onSelect={() => handleSelect()}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Insert Clause</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect()}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            <span>Finalize Agreement</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

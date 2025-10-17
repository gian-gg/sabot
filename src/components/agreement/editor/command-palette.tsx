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
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem>
            <FileText className="mr-2 h-4 w-4" />
            <span>Insert Clause</span>
          </CommandItem>
          <CommandItem>
            <Sparkles className="mr-2 h-4 w-4" />
            <span>Run AI Check</span>
          </CommandItem>
          <CommandItem>
            <Save className="mr-2 h-4 w-4" />
            <span>Save Document</span>
          </CommandItem>
          <CommandItem>
            <Download className="mr-2 h-4 w-4" />
            <span>Export as PDF</span>
          </CommandItem>
          <CommandItem>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            <span>Finalize Agreement</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

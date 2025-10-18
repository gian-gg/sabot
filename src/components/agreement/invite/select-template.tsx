'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Handshake,
  Briefcase,
  Lock,
  ShoppingCart,
  FileText,
} from 'lucide-react';
import { agreementTemplates } from '@/lib/mock-data/agreements';

interface SelectTemplateProps {
  onSelect: (templateId: string) => void;
}

const iconMap = {
  Handshake,
  Briefcase,
  Lock,
  ShoppingCart,
  FileText,
};

export function SelectTemplate({ onSelect }: SelectTemplateProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Select Agreement Template</CardTitle>
        <CardDescription>
          Choose a template that best fits your needs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {agreementTemplates.map((template) => {
            const Icon = iconMap[template.icon as keyof typeof iconMap];
            return (
              <button
                key={template.id}
                onClick={() => onSelect(template.id)}
                className="group border-border bg-card hover:border-primary hover:bg-card/80 relative rounded-lg border-2 p-6 text-left transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 group-hover:bg-primary/20 rounded-lg p-3 transition-colors">
                    <Icon className="text-primary h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 text-lg font-semibold">
                      {template.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {template.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

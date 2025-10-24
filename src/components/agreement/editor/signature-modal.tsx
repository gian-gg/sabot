'use client';

import type React from 'react';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

interface SignatureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplySignature?: (signatureData: string) => void;
}

export function SignatureModal({
  open,
  onOpenChange,
  onApplySignature,
}: SignatureModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [savedSignature, setSavedSignature] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set black pen stroke
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  }, [open]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL();
    setSavedSignature(dataUrl);

    // Apply signature to document if callback is provided
    if (onApplySignature) {
      onApplySignature(dataUrl);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Signature</DialogTitle>
        </DialogHeader>

        <Alert className="border-amber-500/30 bg-amber-500/10">
          <ShieldAlert className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700">
            <strong>Important:</strong> Signatures will not be visible in the
            draft version to prevent forgery. Signatures will only appear in the
            final document when you click &quot;Finalize&quot; and download it.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="draw" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="draw">Draw Signature</TabsTrigger>
            <TabsTrigger value="saved">Saved Signatures</TabsTrigger>
          </TabsList>

          <TabsContent value="draw" className="space-y-4">
            <Card className="bg-muted/30 p-4">
              <canvas
                ref={canvasRef}
                width={600}
                height={200}
                className="w-full cursor-crosshair rounded-lg border border-gray-300"
                style={{ backgroundColor: '#FFFFFF' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            </Card>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={clearCanvas}
                className="flex-1 bg-transparent"
              >
                Clear
              </Button>
              <Button onClick={saveSignature} className="flex-1">
                Save Signature
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="saved" className="space-y-4">
            {savedSignature ? (
              <Card className="bg-muted/30 p-4">
                <div className="relative h-32 w-full">
                  <Image
                    src={savedSignature}
                    alt="Saved signature"
                    fill
                    className="object-contain"
                  />
                </div>
                <Button
                  className="mt-4 w-full"
                  onClick={() => {
                    if (onApplySignature && savedSignature) {
                      onApplySignature(savedSignature);
                    }
                    onOpenChange(false);
                  }}
                >
                  Use This Signature
                </Button>
              </Card>
            ) : (
              <div className="text-muted-foreground py-12 text-center">
                <p>No saved signatures yet.</p>
                <p className="mt-2 text-sm">
                  Draw and save a signature to use it later.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

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

interface SignatureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SignatureModal({ open, onOpenChange }: SignatureModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [savedSignature, setSavedSignature] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#1DB954';
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
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Signature</DialogTitle>
        </DialogHeader>

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
                className="border-border bg-background w-full cursor-crosshair rounded-lg border"
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
                  onClick={() => onOpenChange(false)}
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

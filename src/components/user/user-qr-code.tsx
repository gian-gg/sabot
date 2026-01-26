'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Check, Copy, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface UserQRCodeProps {
  user: {
    id: string;
    name: string;
    image?: string;
    email?: string;
  };
  children: React.ReactNode;
}

export function UserQRCode({ user, children }: UserQRCodeProps) {
  const [copied, setCopied] = useState(false);
  const profileUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/user/${user.id}`
      : `https://www.sabotchain.com/user/${user.id}`;

  // Fetch logo as base64
  const [logoBase64, setLogoBase64] = useState<string>('');

  // Initialize logo
  useEffect(() => {
    if (!logoBase64 && typeof window !== 'undefined') {
      fetch('/logo-original.svg')
        .then((response) => response.blob())
        .then((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            setLogoBase64(reader.result as string);
          };
          reader.readAsDataURL(blob);
        })
        .catch((err) => toast.error('Failed to load logo.'));
    }
  }, [logoBase64]);

  const generateHighResQR = async (size = 512) => {
    const svg = document.getElementById('user-qr-code');
    if (!svg) throw new Error('SVG not found');

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    return new Promise<Blob | null>((resolve, reject) => {
      img.onload = () => {
        canvas.width = size;
        canvas.height = size;

        if (ctx) {
          // Fill white background
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, size, size);

          // Draw image scaled
          ctx.drawImage(img, 0, 0, size, size);
        }

        canvas.toBlob((blob) => resolve(blob), 'image/png');
      };
      img.onerror = reject;
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    });
  };

  const handleCopyQR = async () => {
    try {
      const blob = await generateHighResQR(1200);
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopied(true);
        toast.success('QR Code copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error('Failed to copy QR code:', error);
      toast.error('Failed to copy QR code');
    }
  };

  const handleDownload = async () => {
    try {
      const blob = await generateHighResQR(1200);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.download = `${user.name.replace(/\s+/g, '-').toLowerCase()}-qr-code.png`;
        downloadLink.href = url;
        downloadLink.click();
        URL.revokeObjectURL(url);
        toast.success('QR Code downloaded');
      }
    } catch (error) {
      console.error('Failed to download QR code:', error);
      toast.error('Failed to download QR code');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[90%] max-w-sm border-neutral-800 bg-neutral-900 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            Share Profile
          </DialogTitle>
          <DialogDescription className="text-neutral-400">
            Share this QR code or link to let others view {user.name}&apos;s
            profile.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center">
          {/* QR CODE */}
          <div className="relative flex aspect-square w-full max-w-[280px] items-center justify-center rounded-xl bg-white p-4">
            <div className="relative h-full w-full">
              <QRCodeSVG
                id="user-qr-code"
                value={profileUrl}
                size={undefined}
                className="h-full w-full"
                level="H"
                imageSettings={
                  logoBase64
                    ? {
                        src: logoBase64,
                        x: undefined,
                        y: undefined,
                        height: 48,
                        width: 48,
                        excavate: true,
                      }
                    : undefined
                }
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="border-neutral-700 bg-neutral-800/50 hover:bg-neutral-800 hover:text-white"
              onClick={handleDownload}
            >
              <Download className="mr-2 size-4" />
              Download QR
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleCopyQR}
            >
              {copied ? (
                <Check className="mr-2 size-4" />
              ) : (
                <Copy className="mr-2 size-4" />
              )}
              {copied ? 'Copied QR' : 'Copy QR'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

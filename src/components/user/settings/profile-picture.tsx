'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Upload, User as UserIcon } from 'lucide-react';
import NextImage from 'next/image';
import { useCallback, useRef, useState } from 'react';
import type { Area } from 'react-easy-crop';
import Cropper from 'react-easy-crop';
import { toast } from 'sonner';

interface ProfilePictureProps {
  image?: string;
  name?: string;
}

export function ProfilePicture({ image, name }: ProfilePictureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPG, PNG, or GIF)');
      return;
    }

    // Validate file size (2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    // Load image for cropping
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageToCrop(reader.result as string);
      setIsCropperOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error: Event) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area
  ): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return canvas.toDataURL('image/jpeg');
  };

  const handleFinalSave = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;

    try {
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);

      // Upload to server (Disabled for now)
      // const { success, imageUrl, error } = await uploadProfilePicture(
      //   useUserStore.getState().id,
      //   croppedImage
      // );

      toast.info('Profile picture update is coming soon!');

      // if (!success) {
      //   toast.error(error || 'Failed to upload profile picture');
      //   return;
      // }

      // For prototyping, we just show the cropped image locally without saving
      setPreviewImage(croppedImage);
      setIsCropperOpen(false);
      setIsConfirmOpen(false);
      setImageToCrop(null);
      // toast.success('Profile picture updated successfully');
    } catch (error) {
      toast.error('Failed to crop image');
      console.error(error);
    }
  };

  const handleCropConfirm = () => {
    setIsConfirmOpen(true);
  };

  const handleCropCancel = () => {
    setIsCropperOpen(false);
    setImageToCrop(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const displayImage = previewImage || image;

  return (
    <>
      <div className="flex flex-col items-center gap-4 sm:items-start">
        <div className="group relative cursor-pointer" onClick={handleClick}>
          <div className="group-hover:border-primary/50 relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-xl border-2 border-neutral-800 bg-gradient-to-br from-neutral-900 to-neutral-950 shadow-lg transition-all">
            {displayImage ? (
              <NextImage
                src={displayImage}
                alt={name || 'Profile picture'}
                fill
                className="object-cover"
              />
            ) : (
              <UserIcon className="h-14 w-14 text-neutral-600 transition-colors group-hover:text-neutral-400" />
            )}
          </div>
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <Upload className="h-8 w-8 text-white" />
          </div>
          <div className="bg-primary/20 group-hover:bg-primary/30 absolute -right-2 -bottom-2 rounded-full p-2 transition-transform group-hover:scale-110">
            <Upload className="text-primary h-4 w-4" />
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="text-center sm:text-left">
          <p className="text-xs text-neutral-500">JPG, PNG or GIF • Max 2MB</p>
        </div>
      </div>

      {/* Cropper Dialog */}
      <Dialog open={isCropperOpen} onOpenChange={setIsCropperOpen}>
        <DialogContent className="border-neutral-800 bg-neutral-950 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Crop Your Image</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Adjust the crop area to frame your profile picture perfectly.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Cropper Area */}
            <div className="relative h-80 w-full overflow-hidden rounded-lg bg-neutral-900">
              {imageToCrop && (
                <Cropper
                  image={imageToCrop}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="rect"
                  showGrid={true}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              )}
            </div>

            {/* Zoom Control */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-neutral-400">
                Zoom
              </label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="bg-primary/30 h-2 w-full cursor-pointer appearance-none rounded-lg"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCropCancel}
              className="text-neutral-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCropConfirm} // Now opens confirmation dialog
              className="bg-primary hover:bg-primary/90"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="border-neutral-800 bg-neutral-950">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Change Profile Picture?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-400">
              Do you really want to change your profile picture? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-neutral-800 bg-neutral-900 text-white hover:bg-neutral-800 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFinalSave}
              className="bg-primary hover:bg-primary/90"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

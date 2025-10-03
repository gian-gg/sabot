'use client';
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const ForgotPassword = () => {
  return (
    <Dialog>
      <DialogTrigger className="ml-auto cursor-pointer text-sm underline-offset-4 hover:underline">
        Forgot your password?
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Forgot your password?</DialogTitle>
          <DialogDescription>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Vero,
            impedit eum? Expedita facere aut, tempore soluta repudiandae eaque
            dicta ut!
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPassword;

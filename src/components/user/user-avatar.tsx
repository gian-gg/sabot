import React from 'react';
import Image from 'next/image';

interface UserAvatarProps {
  name: string;
  avatar?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-16 w-16 text-base',
  xl: 'h-24 w-24 text-xl',
};

const sizePx = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
};

export function UserAvatar({
  name,
  avatar,
  size = 'md',
  className = '',
}: UserAvatarProps) {
  const getInitials = (fullName: string) => {
    const parts = fullName.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0).toUpperCase() +
      parts[parts.length - 1].charAt(0).toUpperCase()
    );
  };

  return (
    <div
      className={`${sizeClasses[size]} ${className} flex items-center justify-center overflow-hidden rounded-full border border-neutral-700 bg-gradient-to-br from-blue-500/20 to-purple-500/20 font-semibold text-white`}
    >
      {avatar ? (
        <Image
          src={avatar}
          alt={name}
          width={sizePx[size]}
          height={sizePx[size]}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}

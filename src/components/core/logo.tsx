import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

const Logo = () => {
  return (
    <Link draggable={false} href={ROUTES.ROOT}>
      <Image
        src="/logo-white.svg"
        alt="Sabot"
        width={64}
        height={64}
        draggable={false}
        priority
        className="text-base font-semibold tracking-tight text-white transition-opacity hover:opacity-80"
      />
    </Link>
  );
};

export default Logo;

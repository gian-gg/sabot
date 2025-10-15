import React from 'react';
import Image from 'next/image';

const marketplaces = [
  { name: 'Facebook Marketplace', logo: '/icons/marketplace.svg' },
  { name: 'Carousell', logo: '/icons/carousell.svg' },
  { name: 'Instagram', logo: '/icons/instagram.svg' },
  { name: 'OfferUp', logo: '/icons/offerup.svg' },
  { name: 'OLX', logo: '/icons/olx.svg' },
  { name: 'Telegram', logo: '/icons/telegram.svg' },
  { name: 'WhatsApp', logo: '/icons/whatsapp.svg' },
];

export function MarketplaceCarousel() {
  return (
    <div className="w-full overflow-x-hidden bg-gradient-to-b from-black via-neutral-950 to-black py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-md text-lg text-neutral-400 sm:text-lg">
            Works With Your Favorite Marketplaces
          </h2>
        </div>

        {/* Infinite scroll animation */}
        <div className="relative flex overflow-x-hidden">
          {/* Gradient overlays for fade effect */}
          <div className="absolute top-0 bottom-0 left-0 z-10 w-24 bg-gradient-to-r from-black to-transparent" />
          <div className="absolute top-0 right-0 bottom-0 z-10 w-24 bg-gradient-to-l from-black to-transparent" />

          {/* Scrolling container */}
          <div className="animate-scroll flex items-center">
            {/* First set */}
            {marketplaces.map((marketplace, index) => (
              <div
                key={`first-${index}`}
                className="mx-8 flex-shrink-0 transition-opacity hover:opacity-80"
              >
                <Image
                  src={marketplace.logo}
                  alt={marketplace.name}
                  width={80}
                  height={200}
                  className="h-12 w-auto object-contain"
                />
              </div>
            ))}
            {/* Second set for seamless loop */}
            {marketplaces.map((marketplace, index) => (
              <div
                key={`second-${index}`}
                className="mx-8 flex-shrink-0 transition-opacity hover:opacity-80"
              >
                <Image
                  src={marketplace.logo}
                  alt={marketplace.name}
                  width={100}
                  height={200}
                  className="h-12 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

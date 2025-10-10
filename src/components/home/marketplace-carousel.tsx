'use client';

import React from 'react';

const marketplaces = [
  { name: 'Facebook Marketplace', logo: '🏪' },
  { name: 'Carousell', logo: '🎠' },
  { name: 'Instagram Shopping', logo: '📸' },
  { name: 'eBay', logo: '🔨' },
  { name: 'Shopee', logo: '🛍️' },
  { name: 'Lazada', logo: '🎁' },
  { name: 'OLX', logo: '🏷️' },
  { name: 'Craigslist', logo: '📋' },
];

export function MarketplaceCarousel() {
  return (
    <div className="w-full overflow-x-hidden bg-gradient-to-b from-black via-neutral-950 to-black py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-xl font-bold text-white sm:text-2xl">
            Works With Your Favorite Marketplaces
          </h2>
          <p className="text-sm text-neutral-400">
            Secure transactions across all major platforms
          </p>
        </div>

        {/* Infinite scroll animation */}
        <div className="relative flex overflow-x-hidden">
          {/* Gradient overlays for fade effect */}
          <div className="absolute top-0 bottom-0 left-0 z-10 w-24 bg-gradient-to-r from-black to-transparent" />
          <div className="absolute top-0 right-0 bottom-0 z-10 w-24 bg-gradient-to-l from-black to-transparent" />

          {/* Scrolling container */}
          <div className="animate-scroll flex">
            {/* First set */}
            {marketplaces.map((marketplace, index) => (
              <div
                key={`first-${index}`}
                className="mx-8 flex flex-shrink-0 items-center gap-3 rounded-lg border border-neutral-800/50 bg-neutral-900/40 px-6 py-4 transition-colors hover:bg-neutral-900/60"
              >
                <span className="text-3xl">{marketplace.logo}</span>
                <span className="text-sm font-medium whitespace-nowrap text-white">
                  {marketplace.name}
                </span>
              </div>
            ))}
            {/* Second set for seamless loop */}
            {marketplaces.map((marketplace, index) => (
              <div
                key={`second-${index}`}
                className="mx-8 flex flex-shrink-0 items-center gap-3 rounded-lg border border-neutral-800/50 bg-neutral-900/40 px-6 py-4 transition-colors hover:bg-neutral-900/60"
              >
                <span className="text-3xl">{marketplace.logo}</span>
                <span className="text-sm font-medium whitespace-nowrap text-white">
                  {marketplace.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 30s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

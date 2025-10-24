'use client';

import React from 'react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import {
  Shield,
  Zap,
  TrendingUp,
  FileText,
  Coins,
  Users,
  BookOpen,
  Briefcase,
  Scale,
  Mail,
} from 'lucide-react';

const productItems = [
  {
    title: 'Features',
    href: '/product#features',
    description: 'Discover how Sabot protects your transactions',
    icon: Shield,
  },
  {
    title: 'How It Works',
    href: '/product#how-it-works',
    description: 'Learn about our verification process',
    icon: Zap,
  },
  {
    title: 'Reports',
    href: '/product#reports',
    description: 'View transaction reports and analytics',
    icon: TrendingUp,
  },
  {
    title: 'Documentation',
    href: '/product#docs',
    description: 'API docs and integration guides',
    icon: FileText,
  },
  {
    title: 'Tokens',
    href: '/tokens',
    description: 'Token pricing and packages',
    icon: Coins,
  },
];

const companyItems = [
  {
    title: 'About Us',
    href: '/company#about',
    description: 'Our mission to make transactions safer',
    icon: Users,
  },
  {
    title: 'Blog',
    href: '/company#blog',
    description: 'Latest news and insights',
    icon: BookOpen,
  },
  {
    title: 'Arbiter',
    href: '/company#arbiter',
    description: 'Join our team as a dispute arbiter',
    icon: Scale,
  },
  {
    title: 'Careers',
    href: '/company#careers',
    description: 'Work with us to build safer marketplaces',
    icon: Briefcase,
  },
  {
    title: 'Contact',
    href: '/company#contact',
    description: 'Get in touch with our team',
    icon: Mail,
  },
];

interface ListItemProps extends React.ComponentPropsWithoutRef<'a'> {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
}

const ListItem = React.forwardRef<React.ElementRef<'a'>, ListItemProps>(
  ({ className, title, icon: Icon, description, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block space-y-1 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none',
              className
            )}
            {...props}
          >
            <div className="flex items-start gap-3">
              {Icon &&
                React.createElement(Icon, {
                  className: 'text-primary mt-0.5 h-5 w-5 flex-shrink-0',
                })}
              <div className="space-y-1">
                <div className="text-sm leading-none font-medium">{title}</div>
                {description && (
                  <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                    {description}
                  </p>
                )}
              </div>
            </div>
          </a>
        </NavigationMenuLink>
      </li>
    );
  }
);
ListItem.displayName = 'ListItem';

export function SiteNavigationMenu() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {/* Product Menu */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent">
            Product
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {productItems.map((item) => (
                <ListItem
                  key={item.title}
                  title={item.title}
                  href={item.href}
                  icon={item.icon}
                  description={item.description}
                />
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Company Menu */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent">
            Company
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {companyItems.map((item) => (
                <ListItem
                  key={item.title}
                  title={item.title}
                  href={item.href}
                  icon={item.icon}
                  description={item.description}
                />
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Direct Links */}
        <NavigationMenuItem>
          <Link href={ROUTES.REPORTS} legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Reports
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

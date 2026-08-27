'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, LayoutGrid, User, ShoppingBag } from 'lucide-react';

export default function MobileBottomNav({ currentUser, onCategoryClick }) {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Utama',
      href: '/',
      icon: Home,
      isActive: pathname === '/'
    },
    {
      label: 'Katalog',
      href: '/katalog',
      icon: Grid,
      isActive: pathname.startsWith('/katalog')
    },
    {
      label: 'Dashboard',
      href: currentUser ? '/dashboard' : '/login',
      icon: User,
      isActive: pathname === '/dashboard' || pathname === '/login'
    }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 px-4 py-2 shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center space-y-1 py-1 px-3 rounded-xl transition-all duration-200 active:scale-95 ${
                item.isActive
                  ? 'text-[#111111] font-bold'
                  : 'text-neutral-600 hover:text-[#111111]'
              }`}
            >
              <div className={`relative p-1 rounded-full ${item.isActive ? 'bg-neutral-100' : ''}`}>
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[10px] font-mono tracking-tight uppercase">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

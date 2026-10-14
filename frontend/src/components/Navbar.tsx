'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { usePersona } from '@/context/PersonaContext';
import {
  Activity,
  PlusCircle,
  FileText,
  LayoutDashboard,
  Map,
  SlidersHorizontal,
  Menu,
  X,
  Sparkles,
  LogIn,
  LogOut,
  User as UserIcon,
  HelpCircle,
  Mail,
  Info,
  ShieldCheck,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { role, currentUser, isAuthenticated, logout } = usePersona();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Do not render Navbar on login or registration pages
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const residentLinks = [
    {
      name: 'Report Issue',
      href: '/complaints/new',
      icon: PlusCircle,
      badge: 'New',
    },
    {
      name: 'My Reports',
      href: '/complaints',
      icon: FileText,
    },
    {
      name: 'Contact',
      href: '/contact',
      icon: Mail,
    },
    {
      name: 'FAQ',
      href: '/faq',
      icon: HelpCircle,
    },
    {
      name: 'About',
      href: '/about',
      icon: Info,
    },
  ];

  const adminLinks = [
    {
      name: 'Triage Queue',
      href: '/admin',
      icon: LayoutDashboard,
      badge: 'Live',
    },
    {
      name: 'Spatial Map',
      href: '/admin/map',
      icon: Map,
    },
    {
      name: 'Scoring Rules',
      href: '/admin/rules',
      icon: SlidersHorizontal,
    },
    {
      name: 'All Reports',
      href: '/complaints',
      icon: FileText,
    },
    {
      name: 'Contact',
      href: '/contact',
      icon: Mail,
    },
  ];

  const navLinks = mounted && isAuthenticated && role === 'admin' ? adminLinks : residentLinks;

  return (
    <header className="sticky top-0 z-50 w-full glass-nav border-b border-white/[0.08] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 min-h-16 items-center justify-between overflow-hidden">
          {/* Logo & Brand */}
            <div className="flex min-w-0 flex-1 items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl overflow-hidden border border-emerald-500/40 group-hover:border-emerald-400/70 shadow-[0_0_16px_rgba(16,185,129,0.3)] transition-all duration-300 bg-slate-950">
                <img
                  src="/civicpulse-logo.png"
                  alt="CivicPulse Logo"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  Civic<span className="text-emerald-400">Pulse</span>
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    AI Triage
                  </span>
                </span>
                <span className="text-[10px] text-zinc-400 tracking-wider">
                  Smart Municipal Response
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden min-w-0 flex-1 items-center justify-center space-x-1 overflow-hidden md:flex">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex shrink-0 items-center gap-2 whitespace-nowrap px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                      isActive
                        ? 'text-white bg-white/[0.08] border border-white/10 shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-400'}`} />
                    <span>{link.name}</span>
                    {link.badge && (
                      <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Section: Theme Toggle & Auth Actions (Desktop) */}
          <div className="hidden shrink-0 items-center gap-3 md:flex">
            <ThemeToggle />

            {mounted && isAuthenticated ? (
              <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/10 shadow-inner">
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase shadow-sm">
                    {currentUser.name ? currentUser.name.charAt(0) : <UserIcon className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-white leading-tight max-w-[130px] truncate">
                      {currentUser.name || 'Resident'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                      </span>
                      <span className="text-[10px] text-emerald-400 font-medium">
                        {role === 'admin' ? 'Municipal Admin' : 'Verified Resident'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  title="Sign out of account"
                  className="p-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/register"
                  className="hidden lg:flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
                >
                  <span>Register</span>
                </Link>
              </div>
            )}

            <Link
              href="/complaints/new"
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-500 text-slate-950 font-semibold text-xs tracking-wide hover:bg-emerald-400 transition-all duration-200 shadow-[0_0_18px_rgba(16,185,129,0.3)] hover:shadow-[0_0_22px_rgba(16,185,129,0.45)] hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Submit Issue</span>
            </Link>
          </div>

          {/* Mobile: ThemeToggle + hamburger (Mobile Only) */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-white/10 px-4 pt-2 pb-5 space-y-2 animate-in slide-in-from-top-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-white bg-white/10 border border-white/15'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-400'}`} />
                  <span>{link.name}</span>
                </div>
                {link.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
          <div className="pt-2 space-y-2">
            {mounted && isAuthenticated ? (
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase">
                    {currentUser.name ? currentUser.name.charAt(0) : <UserIcon className="w-4 h-4" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white">{currentUser.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                      <span className="text-xs text-emerald-400 font-medium">
                        {role === 'admin' ? 'Municipal Admin' : 'Verified Resident'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition-colors border border-white/15"
                >
                  <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-medium text-xs transition-colors border border-emerald-500/30"
                >
                  <span>Register</span>
                </Link>
              </div>
            )}

            <Link
              href="/complaints/new"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 text-slate-950 font-semibold text-sm hover:bg-emerald-400 transition-colors shadow-[0_0_18px_rgba(16,185,129,0.3)]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Submit Civic Report</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog8ToothIcon,
  Squares2X2Icon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/generate-recipe', label: 'Generate Recipe' },
    { href: '/about', label: 'About Us' },
  ];

  const authenticatedNavLinks = status === 'authenticated'
    ? [...navLinks, { href: '/dashboard', label: 'Dashboard' }]
    : navLinks;

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const navLinkBaseClass = "px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 ease-in-out";
  const mobileNavLinkBaseClass = "block px-4 py-3 rounded-md text-base font-medium transition-all duration-150 ease-in-out";
  const dropdownItemClass = "group flex items-center w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors duration-150";


  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold group">
              <span className="text-slate-800 group-hover:text-orange-500 transition-colors duration-300">Dish</span>
              <span className="text-orange-500 group-hover:text-slate-800 transition-colors duration-300">Wish</span>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-1 lg:space-x-2">
            {authenticatedNavLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`${navLinkBaseClass} ${
                  pathname === link.href
                    ? 'bg-orange-100 text-orange-600 font-semibold'
                    : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center">
            {status === 'loading' ? (
                <div className="h-10 w-32 bg-gray-200 rounded-md animate-pulse"></div>
            ) : status === 'authenticated' ? (
              <div className="relative ml-3" ref={dropdownRef}>
                <div>
                  <button
                    type="button"
                    onClick={toggleUserDropdown}
                    className="max-w-xs bg-white rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 p-1 hover:bg-slate-100 transition-colors"
                    id="user-menu-button"
                    aria-expanded={isUserDropdownOpen}
                    aria-haspopup="true"
                  >
                    <span className="sr-only">Open user menu</span>
                    {session.user?.image ? (
                        <Image src={session.user.image} alt={session.user.name || "User"} width={36} height={36} className="rounded-full object-cover" />
                    ) : (
                        <UserCircleIcon className="h-9 w-9 text-slate-500" />
                    )}
                    <span className="ml-2 mr-1 text-sm font-medium text-slate-700 hidden lg:block">
                        {session.user?.name?.split(' ')[0] || 'User'}
                    </span>
                    <ChevronDownIcon className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''} hidden lg:block`} />
                  </button>
                </div>
                {isUserDropdownOpen && (
                    <div
                        className="origin-top-right absolute right-0 mt-2 w-60 rounded-md shadow-xl bg-white ring-1 ring-black ring-opacity-5 focus:outline-none py-1 z-20"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="user-menu-button"
                        tabIndex={-1}
                    >
                        <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-medium text-slate-900 truncate" role="none">
                            {session.user?.name || 'DishWish User'}
                        </p>
                        <p className="text-xs text-slate-500 truncate" role="none">
                            {session.user?.email}
                        </p>
                        </div>
                        <Link href="/dashboard" className={dropdownItemClass} role="menuitem" tabIndex={-1}>
                            <Squares2X2Icon className="mr-3 h-5 w-5 text-slate-400 group-hover:text-orange-500" />
                            Dashboard
                        </Link>
                        <Link href="/dashboard/settings" className={dropdownItemClass} role="menuitem" tabIndex={-1}>
                            <Cog8ToothIcon className="mr-3 h-5 w-5 text-slate-400 group-hover:text-orange-500" />
                            Account Settings
                        </Link>
                        <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className={`${dropdownItemClass} w-full text-red-600 hover:text-red-700 hover:bg-red-50`}
                        role="menuitem"
                        tabIndex={-1}
                        >
                            <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-600" />
                            Log Out
                        </button>
                    </div>
                )}
              </div>
            ) : (
              <div className="space-x-2">
                <Link
                  href="/session/new"
                  className={`${navLinkBaseClass} text-gray-700 hover:text-orange-600 hover:bg-orange-50`}
                >
                  Login
                </Link>
                <Link
                  href="/signup/new"
                  className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-md text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300 ease-in-out"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-orange-600 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500 transition-all duration-150"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <XMarkIcon className="block h-7 w-7" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-7 w-7" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`
          md:hidden fixed inset-x-0 top-20 bg-white shadow-xl z-40
          transition-all duration-300 ease-in-out transform
          ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}
        `}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {status === 'authenticated' && session.user && (
            <div className="px-2 py-3 mb-2 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    {session.user.image ? (
                        <Image src={session.user.image} alt={session.user.name || "User"} width={40} height={40} className="rounded-full object-cover" />
                    ) : (
                        <UserCircleIcon className="h-10 w-10 text-slate-500" />
                    )}
                    <div>
                        <p className="text-base font-medium text-slate-800">{session.user.name}</p>
                        <p className="text-sm font-medium text-slate-500 truncate">{session.user.email}</p>
                    </div>
                </div>
            </div>
          )}
          {authenticatedNavLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`${mobileNavLinkBaseClass} ${
                pathname === link.href
                  ? 'bg-orange-100 text-orange-600'
                  : 'text-gray-800 hover:bg-orange-50 hover:text-orange-600'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="pt-4 pb-5 border-t border-gray-200">
          <div className="px-4 space-y-3">
           {status === 'loading' ? (
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse mb-3"></div>
            ) : status === 'authenticated' ? (
                <>
                <Link
                    href="/dashboard/settings"
                    className={`${mobileNavLinkBaseClass} flex items-center w-full text-left text-gray-800 hover:bg-orange-50 hover:text-orange-600`}
                    >
                    <Cog8ToothIcon className="h-5 w-5 mr-3 text-gray-500 group-hover:text-orange-500"/> Account Settings
                </Link>
                <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className={`${mobileNavLinkBaseClass} flex items-center w-full text-left text-red-600 hover:bg-red-50 hover:text-red-700 group`}
                >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 text-red-400 group-hover:text-red-600"/> Log Out
                </button>
                </>
            ) : (
                <>
                 <Link
                    href="/session/new"
                    className={`${mobileNavLinkBaseClass} w-full text-left text-gray-800 hover:bg-orange-50 hover:text-orange-600`}
                    >
                    Login
                    </Link>
                    <Link
                    href="/signup/new"
                    className="block w-full text-center bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-md text-base font-semibold shadow-sm transition-colors duration-300"
                    >
                    Sign Up
                    </Link>
                </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
'use client'

import Link from 'next/link'
import { useTheme } from '@repo/ui/context/ThemeContext';
import { Button } from "@repo/ui/components/ui/button";
import { Sun, Moon, GamepadIcon, ChevronRightIcon } from 'lucide-react';

interface NavbarProps {
  title: string;
  className?: string;
}

export function Navbar({ title, className = '' }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const isDarkTheme = theme === 'dark';

  return (
    <nav className={`
      flex items-center justify-between
      p-4 bg-transparent
      backdrop-blur-sm
      ${isDarkTheme ? 'border-white/10' : 'border-black/10'}
      ${className}
    `}>
      <Link
        href="/"
        className={`
          text-3xl font-extrabold
          transition-all duration-300
          hover:scale-105
          ${isDarkTheme
            ? 'text-amber-300 hover:text-amber-200'
            : 'text-amber-700 hover:text-amber-600'
          }
        `}
      >
        {title}
      </Link>
      <div className="flex items-center space-x-4">
        {/* Theme Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className={`
            transition-all duration-300
            hover:rotate-12 hover:scale-110
            ${isDarkTheme
              ? 'text-amber-300 hover:text-amber-200'
              : 'text-amber-200 hover:text-gray-900'
            }
          `}
        >
          {isDarkTheme
            ? <Sun className="h-6 w-6" />
            : <Moon className="h-6 w-6" />}
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Play Now Button */}
        <NavbarButton />
      </div>
    </nav>
  );
}

export function NavbarButton() {
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark';

  return (
    <Button
      className={`
        group relative overflow-hidden
        ${isDarkTheme
          ? 'bg-gradient-to-br from-amber-800 to-amber-600 text-white'
          : 'bg-gradient-to-br from-amber-600 to-amber-700 text-white'}
        font-bold
        text-md
        rounded-full
        uppercase
        p-4
        border
        border-opacity-30
        border-black
        flex items-center
        transition-all
        duration-300
        hover:scale-105
        active:scale-95
        shadow-lg
        hover:shadow-xl
      `}
    >
      <GamepadIcon className="h-5 w-5 mr-2" />
      Play Now
      <ChevronRightIcon className="ml-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Button>
  );
}

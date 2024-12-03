'use client'

import Link from 'next/link'
import { useTheme } from '@repo/ui/context/ThemeContext';
import { Button } from "@repo/ui/components/ui/button";
import { Sun, Moon, GamepadIcon, ChevronRightIcon, Sword } from 'lucide-react';
import { useRouter } from "next/navigation";

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
          text-4xl font-black
          tracking-tight
          flex items-center
          space-x-2
          transition-all
          duration-300
          hover:scale-105
          hover:tracking-wider
          group
        `}
      >
        <Sword
          className={`
            h-10 w-10 -mt-1
            transition-all
            duration-300
            group-hover:rotate-12
            ${isDarkTheme
              ? 'text-amber-400'
              : 'text-amber-100'
            }
          `}
        />
        <span
          className={`
            bg-gradient-to-r
            ${isDarkTheme
              ? 'from-amber-300 to-orange-400'
              : 'from-amber-100 to-orange-200'
            }
            bg-clip-text
            text-transparent
            transition-all
            duration-300
            group-hover:from-amber-200
            group-hover:to-orange-200
          `}
        >
          {title}
        </span>
      </Link>
      <div className="flex items-center space-x-4">
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
        <NavbarButton />
      </div>
    </nav>
  );
}

export function NavbarButton() {
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark';
  const router = useRouter();

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
      onClick={() => router.push('/play')}
    >
      <GamepadIcon className="h-5 w-5 mr-2" />
      Play Now
      <ChevronRightIcon className="ml-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Button>
  );
}

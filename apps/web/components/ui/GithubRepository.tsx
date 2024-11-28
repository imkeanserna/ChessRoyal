"use client";

import Link from "next/link";
import { useTheme } from '@repo/ui/context/ThemeContext';
import clsx from 'clsx';

interface GithubRepositoryProps {
  link: string;
  className?: string
}

export const GithubRepository: React.FC<GithubRepositoryProps> = ({ link, className }) => {
  const { theme } = useTheme();
  const darkTheme = theme !== 'dark';

  return (
    <Link
      href={link}
      target="_blank"
      className={clsx("hidden lg:block", className)}
    >
      <svg
        className="animate-pulse hover:drop-shadow-[-0.2rem_0_1rem_#ff6b35] github-icon"
        xmlns="http://www.w3.org/2000/svg"
        width="50"
        height="50"
        viewBox="0 0 24 24"
      >
        <defs>
          <linearGradient id="githubGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop
              offset="0%"
              stopColor={darkTheme ? '#1e3a8a' : '#ff6b35'}
              stopOpacity="1"
            />
            <stop
              offset="100%"
              stopColor={darkTheme ? '#374151' : '#ff9f1c'}
              stopOpacity="1"
            />
          </linearGradient>
        </defs>
        <path
          d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
          fill="url(#githubGradient)"
        />
      </svg>
    </Link>
  );
};

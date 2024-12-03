"use client";

import { useState } from 'react';
import { Button } from "@repo/ui/components/ui/button";
import { ChevronRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AnimatedPlayButton() {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  return (
    <Button
      className="
        bg-gradient-to-l from-amber-700 to-amber-400
        hover:bg-amber-700
        text-white
        px-16 py-8
        text-lg
        rounded-full
        flex items-center
        gap-4
        shadow-2xl shadow-black/30
        hover:scale-105
        active:scale-95
        transition-all
        duration-300
        z-10
        uppercase
        relative
        overflow-hidden
        group
      "
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => router.push('/play')}
    >
      {/* Animated Background Layer */}
      <div
        className="
          absolute
          inset-0
          bg-gradient-to-r
          from-amber-600
          to-amber-500
          opacity-0
          group-hover:opacity-100
          transition-opacity
          duration-500
          -z-10
        "
      />

      {/* Animated Particles */}
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          className={`
            absolute
            w-2
            h-2
            bg-white/50
            rounded-full
            opacity-0
            group-hover:opacity-100
            transition-all
            duration-500
            ${isHovered
              ? `
                  animate-[bounce_1s_infinite]
                  delay-${index * 100}
                  top-[-50px]
                  left-[${Math.random() * 100}%]
                `
              : ''
            }
          `}
        />
      ))}

      <div className="flex items-center gap-3">
        <span className="relative">
          Play Now
          <span
            className="
              absolute
              -right-8
              top-1/2
              -translate-y-1/2
              opacity-0
              group-hover:opacity-100
              group-hover:translate-x-full
              transition-all
              duration-300
            "
          >
            <ChevronRightIcon className="w-5 h-5" />
          </span>
        </span>
      </div>
    </Button>
  );
}

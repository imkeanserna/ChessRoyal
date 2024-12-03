"use client";

import CirclesPages from "@/components/homepage/CirclePages";
import { BlackPlanet, GradientOrangeCircle, HalfMoonPlanet, OrangePlanet, SaturnCircle, StripeCircle } from "@/components/homepage/Circles";
import { Navbar } from "@/components/homepage/navbar";
import Image from "next/image";
import { useTheme } from '@repo/ui/context/ThemeContext';
import ShootingStars from "@/components/homepage/ShootingStars";

export default function Page() {
  const { theme } = useTheme();
  const darkTheme = theme === 'dark';

  return (
    <div
      className={`relative min-h-screen overflow-hidden background-animate animate-gradient-x ${darkTheme
        ? 'bg-background'
        : 'bg-gradient-to-r from-orange-700 via-amber-600 to-orange-700'
        }`}
    >
      <ShootingStars />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(300)].map((_, index) => (
          <div
            key={index}
            className="absolute bg-white/70 rounded-full animate-twinkle"
            style={{
              width: `${Math.random() * 2 + 2}px`,
              height: `${Math.random() * 2 + 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 3 + 2}s`
            }}
          />
        ))}
      </div>
      {/* div shadow right */}
      <div
        className={`
        absolute
        right-0
        top-[-200px]
        w-[1000px]
        h-[400px]
        ${darkTheme ? 'bg-white/10' : 'bg-black/50'}
        blur-2xl
        transform
        rotate-[-40deg]
        origin-top-right
      `}
      ></div>
      {/* div shadow left */}
      <div
        className={`
        absolute
        left-[-30px]
        bottom-[-30px]
        w-[700px]
        h-[400px]
        ${darkTheme ? 'bg-white/10' : 'bg-black/50'}
        blur-2xl
        transform
        origin-top-right
        z-30
      `}
      ></div>
      <div className="pt-6 px-12">
        <Navbar title="Chess Royal" />
      </div>

      <SaturnCircle
        width="200px"
        height="200px"
        position={{ top: '70px', left: '350px' }}
      />
      <StripeCircle
        width="200px"
        height="200px"
        position={{ top: '100px', right: '450px' }}
      />
      <OrangePlanet
        width="160px"
        height="160px"
        position={{ top: '280px', right: '260px' }}
      />
      <BlackPlanet
        width="200px"
        height="200px"
        position={{ bottom: '200px', right: '320px' }}
      />
      <HalfMoonPlanet
        width="70px"
        height="70px"
        position={{ bottom: '400px', right: '200px' }}
      />
      <HalfMoonPlanet
        width="100px"
        height="100px"
        position={{ bottom: '400px', left: '200px' }}
      />
      <GradientOrangeCircle
        width="90px"
        height="90px"
        position={{ top: '500px', right: '500px' }}
      />
      <GradientOrangeCircle
        width="50px"
        height="50px"
        position={{ top: '200px', right: '680px' }}
      />
      <GradientOrangeCircle
        width="50px"
        height="50px"
        position={{ bottom: '200px', left: '400px' }}
      />

      <CirclesPages />

      <div className="relative w-full max-w-[1000px] h-[600px] md:h-[800px] lg:h-[1000px] mx-auto">
        {/* Shadow Layer */}
        <div className="absolute inset-0
          bg-black
          rounded-full
          opacity-30
          blur-2xl
          transform
          translate-y-6
          scale-90
          -z-10
        "></div>

        <div className="relative w-full h-full rounded-full overflow-hidden
          transform
          transition-all
          duration-300
        ">
          <Image
            src={`/homepage/chessBoard.png`}
            alt={`chess board`}
            fill
            className="
              object-cover
              rounded-full
              brightness-110
              contrast-125
              saturate-150
              transition-all
              duration-300
              hover:brightness-125
              hover:contrast-150
            "
          />

          {/* Shadow Layer */}
          <div
            className={`
            absolute inset-x-0 top-1/2
            h-[400px] w-full
            ${darkTheme ? 'bg-white/30' : 'bg-black'}
            rounded-full
            opacity-30
            blur-2xl
            transform translate-y-[-20%] scale-90 -z-10
          `}
          ></div>
        </div>
      </div>
    </div>
  );
}

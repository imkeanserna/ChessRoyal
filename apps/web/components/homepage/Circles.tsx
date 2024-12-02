"use client";

import React, { useState, useEffect } from 'react';

export const SaturnCircle = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: any) => {
      setPosition({
        x: event.clientX / 20,
        y: event.clientY / 20
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      className="absolute left-[300px] top-[70px] flex items-center justify-center"
      style={{
        width: '200px',
        height: '200px',
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      {/* Saturn's Rings */}
      <div
        className="absolute rounded-full w-52 h-52 border-4 border-black"
        style={{
          background: 'conic-gradient(from 120deg, rgba(255,120,0,0.3) 0%, rgba(255,90,0,0.5) 25%, rgba(40,40,40,0.4) 50%, rgba(255,120,0,0.3) 75%, rgba(255,90,0,0.5) 100%)',
          filter: 'blur(2px)',
          animation: 'rotateRing 4s linear infinite',
          boxShadow: '0 0 20px rgba(255,120,0,0.3)',
        }}
      />

      {/* Inner Glow Layer */}
      <div
        className="absolute rounded-full w-52 h-52 opacity-30"
        style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(255,165,0,0.2) 0%, rgba(255,120,0,0.1) 50%, rgba(0,0,0,0.2) 100%)',
          transform: 'scale(1.05)',
          zIndex: 5,
        }}
      />

      {/* Circle (Saturn) */}
      <div
        className="absolute rounded-full w-36 h-36 shadow-lg"
        style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(255, 128, 0, 0.8) 0%, rgba(255, 165, 0, 0.6) 30%, rgba(40, 40, 40, 0.4) 40%, rgba(20, 20, 20, 0.8) 60%, rgba(10, 10, 10, 0.9) 100%)',
          transform: `scale(1)`,
          transition: 'transform 0.3s ease-out',
          zIndex: 10,
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
        }}
      />
    </div>
  );
};


export const StripeCircle = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: any) => {
      setPosition({
        x: event.clientX / 20,
        y: event.clientY / 20
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      className="absolute right-[500px] flex items-center justify-center"
      style={{
        width: '200px',
        height: '200px',
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      {/* Saturn's Rings */}
      <div
        className="absolute rounded-full w-52 h-52 border-4 border-amber-200"
        style={{
          background: 'conic-gradient(from 120deg, rgba(255,120,0,0.3) 0%, rgba(255,90,0,0.5) 25%, rgba(40,40,40,0.4) 50%, rgba(255,120,0,0.3) 75%, rgba(255,90,0,0.5) 100%)',
          filter: 'blur(2px)',
          animation: 'rotateRing 4s linear infinite',
          boxShadow: '0 0 20px rgba(255,120,0,0.3)',
        }}
      />
      {/* Inner Glow Layer */}
      <div
        className="absolute rounded-full w-52 h-52 opacity-30"
        style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(255,165,0,0.2) 0%, rgba(255,120,0,0.1) 50%, rgba(0,0,0,0.2) 100%)',
          transform: 'scale(1.05)',
          zIndex: 5,
        }}
      />
      {/* Circle (Saturn) */}
      <div
        className="absolute rounded-full w-36 h-36 shadow-lg overflow-hidden border-2 border-amber-200"
        style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(255, 128, 0, 0.8) 0%, rgba(255, 165, 0, 0.6) 30%, rgba(40, 40, 40, 0.4) 40%, rgba(20, 20, 20, 0.8) 60%, rgba(10, 10, 10, 0.9) 100%)',
          transform: `scale(1)`,
          transition: 'transform 0.3s ease-out',
          zIndex: 10,
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          backgroundImage: 'repeating-linear-gradient(120deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 3%, transparent 6%, transparent 12%)',
          backgroundBlendMode: 'overlay',

        }}
      />
    </div>
  );
}

export const OrangePlanet = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: any) => {
      setPosition({
        x: event.clientX / 20,
        y: event.clientY / 20
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <svg width="160" height="160" viewBox="0 0 200 200"
      className="absolute right-[300px] top-[280px]"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      <defs>
        <linearGradient id="planetGradient" x1="50%" y1="50%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ec6b37" stopOpacity="1" /> {/* Tailwind's border-amber-200 color */}
          <stop offset="50%" stopColor="b94e2e" stopOpacity="1" />
          <stop offset="100%" stopColor="#black" stopOpacity="1" /> {/* Dark orange color */}
        </linearGradient>

        {/* Drop shadow filter */}
        <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow
            dx="4"
            dy="4"
            stdDeviation="5"
            floodColor="rgba(0, 0, 0, 0.5)"
          />
        </filter>
      </defs>

      <circle
        cx="100"
        cy="100"
        r="90"
        fill="url(#planetGradient)"
        filter="url(#dropShadow)"
      />
    </svg>
  );
}

export const BlackPlanet = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: any) => {
      setPosition({
        x: event.clientX / 20,
        y: event.clientY / 20
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      className="absolute right-[320px] bottom-[200px] flex items-center justify-center"
      style={{
        width: '200px',
        height: '200px',
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      {/* Saturn's Rings */}
      <div
        className="absolute rounded-full w-40 h-40 border-2 border-black"
        style={{
          background:
            'conic-gradient(from 120deg, rgba(255,120,0,0.3) 0%, rgba(255,90,0,0.5) 25%, rgba(40,40,40,0.4) 50%, rgba(255,120,0,0.3) 75%, rgba(255,90,0,0.5) 100%)',
          filter: 'blur(2px)',
          animation: 'rotateRing 4s linear infinite',
          boxShadow: '0 0 20px rgba(255,120,0,0.3)',
        }}
      />

      {/* Inner Glow Layer */}
      <div
        className="absolute rounded-full w-40 h-40 opacity-30"
        style={{
          background:
            'radial-gradient(circle at 50% 30%, rgba(255,165,0,0.2) 0%, rgba(255,120,0,0.1) 50%, rgba(0,0,0,0.2) 100%)',
          transform: 'scale(1.05)',
          zIndex: 5,
        }}
      />

      {/* Circle (Saturn) with White Gradient at Top */}
      <div
        className="absolute rounded-full w-28 h-28 shadow-lg border-2 border-gray-800"
        style={{
          background:
            'radial-gradient(circle at 50% 20%, rgba(255,255,255,0.2) 0%, rgba(0,0,0,1) 100%)',
          transform: `scale(1)`,
          transition: 'transform 0.3s ease-out',
          zIndex: 10,
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
        }}
      />
    </div>
  );
}

export const HalfMoonPlanet = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: any) => {
      setPosition({
        x: event.clientX / 20,
        y: event.clientY / 20
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <svg width="70" height="70" viewBox="0 0 200 200"
      className="absolute right-[200px] bottom-[400px]"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      {/* Gradient Definitions */}
      <defs>
        {/* Gradient for the Outer Circle */}
        <linearGradient id="outerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.8" /> {/* Top gradient */}
          <stop offset="100%" stopColor="orange" stopOpacity="1" /> {/* Bottom color */}
        </linearGradient>

        {/* Gradient for the Crescent Moon */}
        <linearGradient id="moonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ea580c" /> {/* Dark orange */}
          <stop offset="50%" stopColor="#f59e0b" /> {/* Amber */}
          <stop offset="100%" stopColor="#ea580c" /> {/* Dark orange */}
        </linearGradient>

        {/* Shadow Filter */}
        <filter id="shadowFilter" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow
            dx="0" /* Horizontal shadow offset */
            dy="4" /* Vertical shadow offset */
            stdDeviation="6" /* Blur amount */
            floodColor="rgba(0, 0, 0, 0.5)" /* Shadow color */
          />
        </filter>
      </defs>

      {/* Outer Circle */}
      <circle
        cx="100"
        cy="100"
        r="80"
        fill="black"
        strokeWidth="2"
        filter="url(#shadowFilter)"
      />

      {/* Crescent Moon */}
      <path
        d="M100 20
         C140 60, 140 140, 100 180
         A80 80 0 0 1 100 20"
        fill="url(#moonGradient)" /* Applying the gradient */
        transform="rotate(40 100 100)"
      />
    </svg>
  );
}

export const GradientOrangeCircle = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setPosition({
        x: event.clientX / 20,
        y: event.clientY / 20,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <svg
      width="90"
      height="90"
      viewBox="0 0 200 200"
      className="absolute right-[500px] top-[500px]"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      {/* Gradient Definitions */}
      <defs>
        {/* Gradient for the Outer Circle */}
        <linearGradient id="outerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.8" /> {/* Top gradient */}
          <stop offset="100%" stopColor="orange" stopOpacity="1" /> {/* Bottom color */}
        </linearGradient>

        {/* Gradient for the Crescent Moon */}
        <linearGradient id="moonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ea580c" /> {/* Dark orange */}
          <stop offset="50%" stopColor="#f59e0b" /> {/* Amber */}
          <stop offset="100%" stopColor="#ea580c" /> {/* Dark orange */}
        </linearGradient>

        {/* Shadow Filter */}
        <filter id="shadowFilter" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow
            dx="0" /* Horizontal shadow offset */
            dy="4" /* Vertical shadow offset */
            stdDeviation="6" /* Blur amount */
            floodColor="rgba(0, 0, 0, 0.5)" /* Shadow color */
          />
        </filter>
      </defs>

      {/* Outer Circle */}
      <circle
        cx="100"
        cy="100"
        r="80"
        fill="url(#outerGradient)" /* Changed to use the orange gradient */
        strokeWidth="2"
        filter="url(#shadowFilter)"
      />
    </svg>
  );
}

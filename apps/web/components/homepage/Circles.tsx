"use client";

import React, { useState, useEffect } from 'react';

const Circle = () => {
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
      className="relative flex items-center justify-center"
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
          background: 'conic-gradient(from 90deg, rgba(255,120,0,0.3) 0%, rgba(255,90,0,0.5) 25%, rgba(40,40,40,0.4) 50%, rgba(255,120,0,0.3) 75%, rgba(255,90,0,0.5) 100%)',
          filter: 'blur(4px)',
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

export default Circle;

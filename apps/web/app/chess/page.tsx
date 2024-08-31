"use client";
// pages/index.tsx
import { useEffect, useState } from 'react';
import { useWebSocket } from '~/context/SocketProvider';

export default function Home() {
  const { socket, sendMessage, isConnected } = useWebSocket();

  useEffect(() => {
    if (!socket) {
      console.log("no socket");
      return;
    }
    console.log("socket", socket);
  }, [socket]);


  if (!isConnected) {
    return <div>Connecting socket.....</div>
  }

  return (
    <div>Testing</div>
  );
}

"use client";

import { useSocketContext } from "@repo/ui/context/socketContext"
import { useEffect } from "react"


export default function Page() {
  const { socket, sendMessage, errorMessage } = useSocketContext();

  useEffect(() => {
    if (!socket) {
      return;
    }
    console.log("welcome to the online play page");
  }, []);

  return (
    <div>
      {errorMessage}
      <p>Choose what type of play</p>
    </div>
  )
}

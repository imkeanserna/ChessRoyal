"use client";

import { PropsWithChildren, useEffect, useRef, useState } from "react";
import { SocketContext } from "@repo/ui/context/socketContext";

interface EventHandlers {
  [key: string]: (data: any) => void
}

export const SocketContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const eventHandlerRef = useRef<EventHandlers>({});
  const eventHandlers = eventHandlerRef.current;

  const closeEventListener = (event: CloseEvent) => {
    if (!event.wasClean) {
      setErrorMessage("Connection was closed due to an error");
    }
  }

  const openEventListener = () => {
    console.log("You need to send an id to the server");
  }

  useEffect(() => {
    const newSocket = new WebSocket(process.env.NEXT_PUBLIC_SOCKET_URL!);

    newSocket.addEventListener("open", openEventListener);
    newSocket.addEventListener("close", closeEventListener);

    // newSocket.onmessage = (messageEvent) => {
    //   const { event, data } = JSON.parse(messageEvent.data);
    //
    //   if (!event || !data) {
    //     return;
    //   }
    //
    //   if (event === "error") {
    //     if (data.message && typeof data.message === "string") {
    //       setErrorMessage(data.message);
    //     } else {
    //       setErrorMessage("Something went wrong");
    //     }
    //     return;
    //   }
    //
    //   const eventHandler = eventHandlers[event];
    //
    //   if (eventHandler) {
    //     eventHandler(data);
    //   }
    // }

    setSocket(newSocket);

    return () => {
      newSocket.removeEventListener("close", closeEventListener);
      newSocket.removeEventListener("open", openEventListener);
      newSocket.close();
    }
  }, []);

  const sendMessage = (event: string, data?: any) => {
    if (!socket) {
      return;
    }

    const payload: { event: string, data?: any } = {
      event: event,
    };

    if (data) {
      payload.data = data;
    }

    socket.send(JSON.stringify(payload));
  }

  const on = (event: string, eventHandler: (data: any) => void) => {
    eventHandlers[event] = eventHandler;
  };

  return <SocketContext.Provider
    value={{
      socket,
      sendMessage,
      errorMessage,
    }}
  >
    {children}
  </SocketContext.Provider>
}

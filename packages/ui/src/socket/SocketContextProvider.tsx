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

  function openEventListener() {
    if (!socket) {
      return
    }
    // you must authentication here
    // socket.send(JSON.stringify({ event: "init_game" }));
  }

  useEffect(() => {
    const newSocket = new WebSocket(process.env.NEXT_PUBLIC_BACKEND_URL!);

    newSocket.addEventListener("close", closeEventListener);
    newSocket.addEventListener("open", openEventListener);

    newSocket.onmessage = (messageEvent) => {
      const { event, data } = JSON.parse(messageEvent.data);

      if (!event || !data) {
        return;
      }

      if (event === "error") {
        if (data.message && typeof data.message === "string") {
          setErrorMessage(data.message);
        } else {
          setErrorMessage("Something went wrong");
        }
        return;
      }

      const eventHandler = eventHandlers[event];

      if (eventHandler) {
        eventHandler({
          data: {
            test: "test"
          }
        });
      }
    }

    setSocket(newSocket);

    return () => {
      newSocket.removeEventListener("close", closeEventListener);
      newSocket.removeEventListener("open", openEventListener);
      newSocket.close();
    }
  }, []);

  const sendMessage = (event: string, data?: any) => {
    if (!socket) {
      console.log("no socket");
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
      on
    }}
  >
    {children}
  </SocketContext.Provider>
}

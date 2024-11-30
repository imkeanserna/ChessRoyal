"use client";

import { PropsWithChildren, useEffect, useRef, useState } from "react";
import { SocketContext } from "@repo/ui/context/socketContext";
import { v4 as uuidv4 } from 'uuid';
import type { User } from "next-auth";
import { toast } from "sonner";

interface EventHandlers {
  [key: string]: (data: any) => void
}

interface SocketContextProviderProps extends PropsWithChildren {
  user?: User;
}

export const SocketContextProvider: React.FC<SocketContextProviderProps> = ({
  children,
  user
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

  function openEventListener(this: WebSocket) {
    if (user) {
      this.send(
        JSON.stringify({
          event: "auth",
          data: {
            id: user.id!,
            name: user.name,
            isGuest: false,
            avatar: user.image,
          },
        }),
      );
    } else {
      let guestId = localStorage.getItem("id");
      if (!guestId) {
        guestId = uuidv4();
        if (!guestId) {
          return;
        }
        localStorage.setItem("id", guestId);
      }
      const lastIdPart = guestId.split('-').pop()?.slice(-10);
      this.send(
        JSON.stringify({
          event: "auth",
          data: {
            id: guestId,
            name: `Guest${lastIdPart}`,
            isGuest: true,
          },
        }),
      );
    }
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
      toast.info("Waiting for connection to server");
      return;
    }

    const payload: { event: string, payload?: any } = {
      event: event,
    };

    if (data) {
      payload.payload = data;
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

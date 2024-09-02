import { ReactNode } from "react";
import { SocketContextProvider } from "@repo/ui/socket/SocketContextProvider";
import SocketError from "@/components/SocketError";

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <SocketContextProvider>
      <SocketError>
        {children}
      </SocketError>
    </SocketContextProvider>
  );
}

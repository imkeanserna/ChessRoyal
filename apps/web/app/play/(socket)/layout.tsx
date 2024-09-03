import { ReactNode } from "react";
import { SocketContextProvider } from "@repo/ui/socket/SocketContextProvider";
import SocketError from "@/components/SocketError";
import Provider from "@/components/Provider";

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <SocketContextProvider>
      <SocketError>
        <Provider>
          {children}
        </Provider>
      </SocketError>
    </SocketContextProvider>
  );
}

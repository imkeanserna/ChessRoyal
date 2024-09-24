import { ReactNode } from "react";
import { SocketContextProvider } from "@repo/ui/socket/SocketContextProvider";
import SocketError from "@/components/SocketError";
import Provider from "@/components/Provider";
import RecoilContextProvider from "@/components/Provider";

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <RecoilContextProvider>
      <SocketContextProvider>
        <SocketError>
          {children}
        </SocketError>
      </SocketContextProvider>
    </RecoilContextProvider>
  );
}

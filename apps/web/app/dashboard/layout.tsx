import type { Metadata } from "next";
import { SocketContextProvider } from "@repo/ui/socket/SocketContextProvider";
import SocketError from "@/components/SocketError";
import { currentUser } from "@/lib";

export const metadata: Metadata = {
  title: "Chess Royal",
  description: "Chess game for royal players",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  return (
    <SocketContextProvider user={user}>
      <SocketError>
        {children}
      </SocketError>
    </SocketContextProvider>
  );
}

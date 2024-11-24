"use client";

import ChessMenu from "@/components/ChessMenu";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (session) {
    router.push("/");
    return null;
  }

  return (
    <>
      <ChessMenu />
    </>
  )
}

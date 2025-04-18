"use client";

import ChessMenu from "@/components/ChessMenu";
import SkeletonGuest from "@/components/ui/skeleton/SkeletonGuest";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  if (status === "loading") {
    return <SkeletonGuest />;
  }

  return (
    <>
      {!session && <ChessMenu />}
    </>
  );
}

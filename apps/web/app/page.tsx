import { currentUser } from "@/lib";
import { Button } from "@repo/ui/components/ui/button";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await currentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <main>
      <p className="text-3xl bg-red-500">asdasd</p>
      <p>{JSON.stringify(user)}</p>
      <Button>Click me</Button>
    </main>
  );
}

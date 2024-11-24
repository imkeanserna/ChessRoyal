// import { LoginForm } from "@repo/ui/components/loginForm";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib";

export default async function Page() {
  const user = await currentUser();

  if (user) {
    redirect("/");
  }

  return (
    <div className="flex w-full h-full items-center justify-center">
      {/* <LoginForm /> */}
    </div>
  );
};

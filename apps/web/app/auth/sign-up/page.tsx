import { currentUser } from "@/lib";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await currentUser();

  if (user) {
    redirect("/");
  }

  return (
    <div className="flex w-full h-full items-center justify-center">
      {/* <SignUpForm onSubmitAction={signUpUser} /> */}
    </div>
  );
}

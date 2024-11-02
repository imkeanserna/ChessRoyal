import { signUpUser } from "@/lib";
import { SignUpForm } from "@repo/ui/components/signupForm";

export default function Page() {
  return (
    <div className="flex w-full h-full items-center justify-center">
      <SignUpForm onSubmitAction={signUpUser} />
    </div>
  );
};

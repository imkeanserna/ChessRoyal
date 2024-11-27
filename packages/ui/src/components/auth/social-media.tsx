import { Button } from "@repo/ui/components/ui/button";
import { signIn } from "next-auth/react";
import { FC } from "react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

export const SocialMediaButtons: FC = () => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Button
        variant="outline"
        className="w-full bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
        onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
      >
        <FcGoogle className="w-5 h-5 mr-2" />
        Google
      </Button>
      <Button
        variant="outline"
        className="w-full bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
        onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
      >
        <FaGithub className="w-5 h-5 mr-2" />
        GitHub
      </Button>
    </div>
  );
}

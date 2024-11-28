import ChessGameHistory from "@/components/GameHistory";
import InitializeButton from "@/components/InitializeButton";
import ProfileDropdown from "@/components/ProfileDropdown";
import { GithubRepository } from "@/components/ui/GithubRepository";
import { currentUser } from "@/lib";
import { User } from "next-auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const user: User | null = await currentUser();

  if (!user) {
    redirect("/play");
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-end bg-gradient-to-b from-neutral-900 to-neutral-950">
      <div className="z-50 absolute top-8 right-8">
        <ProfileDropdown user={user} />
      </div>
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{
          backgroundImage:
            "url('https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExdmx5bGkwbTVzaTAwNm45NTNlcWxkZmtnbW94NTJ2Mzd6ajUyM2dqNCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/9POMmQiLkvhRzKFXyT/giphy.webp')", // Replace with the actual image path
        }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-800/10 rounded-full blur-3xl animate-float-delayed" />
      </div>

      {/* Chessboard Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full bg-[repeating-conic-gradient(theme(colors.amber.900)_0%_25%,theme(colors.transparent)_0%_50%)] bg-[length:40px_40px]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl px-4 space-y-12 mb-36">
        <ChessGameHistory userId={"asdasdasd12"} />
        <div className="text-center flex justify-center space-y-4 px-10">
          <div className="w-[200px]">
            <InitializeButton user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}

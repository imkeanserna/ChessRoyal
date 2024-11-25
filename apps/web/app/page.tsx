import { currentUser } from "@/lib";
import { Button } from "@repo/ui/components/ui/button";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await currentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-neutral-900 to-neutral-950">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,53,15,0.2),rgba(0,0,0,0))]" />
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-600/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-800/5 rounded-full blur-3xl animate-float-delayed" />
      </div>
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full bg-[repeating-conic-gradient(theme(colors.amber.900)_0%_25%,theme(colors.transparent)_0%_50%)] bg-[length:40px_40px]" />
      </div>
      <div className="relative z-10 w-full max-w-6xl px-4">
        <div className="flex flex-col justify-center items-center gap-8 rounded-xl p-6 shadow-2xl">
          <div className="text-center space-y-4">
            <p className="text-3xl text-amber-200">User Details</p>
            <pre className="text-amber-100/70 p-4 bg-neutral-800/50 rounded-md overflow-auto max-h-64">
              {JSON.stringify(user, null, 2)}
            </pre>
            <Button
              className="bg-gradient-to-r from-amber-900/90 to-amber-800/90 hover:from-amber-800/90 hover:to-amber-700/90
              text-amber-100 border-2 border-amber-600/20 shadow-lg shadow-amber-900/20 hover:shadow-amber-900/40
              transform transition-all duration-300 px-8 py-6"
            >
              Click me
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

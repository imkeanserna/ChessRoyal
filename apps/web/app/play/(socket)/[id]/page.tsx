import ChessGame from "@/components/ChessGame";
import ProfileDropdown from "@/components/ProfileDropdown";
import { User } from "next-auth";
import { currentUser } from "@/lib";

export default async function Page({ params }: { params: { id: string } }) {
  const user: User | null = await currentUser();
  const gameId = params.id;

  return (
    <div>
      <div className="z-50 absolute top-8 right-8">
        <ProfileDropdown user={user} />
      </div>
      <ChessGame gameId={gameId} />
    </div>
  )
}

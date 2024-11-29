import { NextResponse } from 'next/server';
import db from "@repo/db/client";
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log("ASdasdasdasddddddddddddd")
    console.log(session)

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;
    const games = await db.chessGame.findMany({
      where: {
        players: {
          some: {
            id: userId
          },
        },
      },
      include: {
        result: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log("+============================= games ==================================")
    console.log(games)

    return NextResponse.json({ success: true, games });
  } catch (error) {
    console.error('Error fetching user games:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch games' }, { status: 500 });
  }
}

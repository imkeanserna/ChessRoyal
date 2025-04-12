import { NextResponse } from 'next/server';
import { db } from "@repo/db/server";
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

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

    return NextResponse.json({ success: true, games });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch games' }, { status: 500 });
  }
}

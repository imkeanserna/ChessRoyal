import db from "@repo/db/client";

export async function deleteGameIfBothPlayersAreGuests(gameId: string, player1Id: string, player2Id: string) {
  try {
    const player1 = await db.player.findUnique({
      where: { id: player1Id },
    });

    const player2 = await db.player.findUnique({
      where: { id: player2Id },
    });

    if (player1?.isGuest) {
      await db.player.delete({
        where: { id: player1Id },
      });
    }

    if (player2?.isGuest) {
      await db.player.delete({
        where: { id: player2Id },
      });
    }

    if (player1?.isGuest && player2?.isGuest) {
      await db.chessMove.deleteMany({
        where: { gameId: gameId },
      });

      await db.chessResult.deleteMany({
        where: { gameId: gameId },
      });

      await db.chessGame.delete({
        where: { id: gameId },
      });
    }
  } catch (error) {
    console.error("Error in deleteGameIfBothPlayersAreGuests:", error);
  }
}

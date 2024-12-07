import { Job } from 'bullmq';
import { logger } from './utils';
import db from "@repo/db/client";

export interface TaskPayload {
  type: string;
  data: any;
}

export class ChessEventHandlers {
  static async handleUpdateChessGame(job: Job<TaskPayload>) {
    const { data } = job.data;

    try {
      await db.chessGame.update({
        where: {
          id: data.gameId,
        },
        data: {
          whitePlayerRemainingTime: data.player1RemainingTime,
          blackPlayerRemainingTime: data.player2RemainingTime
        }
      });
    } catch (error) {
      logger.error('Chess game update failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        gameId: data.gameId
      });
      throw error;
    }
  }

  static async handleCreateMove(job: Job<TaskPayload>) {
    const { data } = job.data;

    try {
      await db.chessMove.create({
        data: {
          gameId: data.gameId,
          playerId: data.userId,
          move: data.move
        }
      });
    } catch (error) {
      logger.error('Chess move create failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        data
      });
      throw error;
    }
  }

  static async handleDeletePlayers(job: Job<TaskPayload>) {
    const { data } = job.data;

    try {
      const player1 = await db.player.findUnique({
        where: { id: data.player1Id },
      });

      const player2 = await db.player.findUnique({
        where: { id: data.player2Id },
      });

      if (player1?.isGuest) {
        await db.player.delete({
          where: { id: data.player1Id },
        });
      }

      if (player2?.isGuest) {
        await db.player.delete({
          where: { id: data.player2Id },
        });
      }

      if (player1?.isGuest && player2?.isGuest) {
        await db.chessMove.deleteMany({
          where: { gameId: data.gameId },
        });

        await db.chessResult.deleteMany({
          where: { gameId: data.gameId },
        });

        await db.chessGame.delete({
          where: { id: data.gameId },
        });
      }
    } catch (error) {
      logger.error('Chess player delete failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        data
      });
      throw error;
    }
  }
}

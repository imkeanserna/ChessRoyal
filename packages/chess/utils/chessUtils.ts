import { Square } from "chess.js";

export const calculateSquarePosition = (
  square: Square,
  isFlipped: boolean,
  squareSize: number
): { x: number, y: number } => {
  // 'a' -> 0, 'b' -> 1, etc.
  let col = square.charCodeAt(0) - 97;
  let row = 8 - parseInt(square.charAt(1));

  if (isFlipped) {
    col = 7 - col;
    row = 7 - row;
  }

  return {
    x: col * squareSize,
    y: row * squareSize
  };
};

export function cubicBezier(x1: number, y1: number, x2: number, y2: number, t: number): number {
  // Cubic Bezier curve implementation
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;

  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  // Solve for y using Newton's method to approximate x position
  let x = t;
  for (let i = 0; i < 5; i++) {
    const xCurr = ((ax * x + bx) * x + cx) * x;
    const xDiff = xCurr - t;
    if (Math.abs(xDiff) < 0.001) break;

    const xDerivative = ((3 * ax * x + 2 * bx) * x + cx);
    if (xDerivative === 0) break;

    x = x - xDiff / xDerivative;
  }

  return ((ay * x + by) * x + cy) * x;
}

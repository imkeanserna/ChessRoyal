import { atom } from "recoil";

interface User {
  id: string;
}

export const userAtom = atom<User | null>({
  key: "user",
  default: null
});

export const userSelectedMoveIndexAtom = atom<number | null>({
  key: "userSelectedMoveIndex",
  default: null
})

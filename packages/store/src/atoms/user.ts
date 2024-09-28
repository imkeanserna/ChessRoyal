import { atom } from "recoil";

interface User {
  id: string;
}

// i think we need to store the user in localStorage here:
// export const userAtom = atom<User | null>({
//   key: "user",
//   default: null
// });
//

export const userAtom = atom<User | null>({
  key: "user",
  default: null,
  effects_UNSTABLE: [
    ({ setSelf, onSet }) => {
      // Check if running in the browser environment
      if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
        // On atom initialization, read from localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const parsedUser: User = JSON.parse(storedUser);
            setSelf(parsedUser); // Initialize the atom with the stored user
          } catch (error) {
            console.error("Failed to parse user from localStorage:", error);
          }
        }

        // Whenever the atom's value changes, update localStorage
        onSet((newUser, _, isReset) => {
          if (isReset || !newUser) {
            localStorage.removeItem("user");
          } else {
            localStorage.setItem("user", JSON.stringify(newUser));
          }
        });
      }
    }
  ]
});

export const userSelectedMoveIndexAtom = atom<number | null>({
  key: "userSelectedMoveIndex",
  default: null
})

"use server";

import bcrypt from "bcrypt";
import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import { addUser } from "@repo/db/user";

export const currentUser = async () => {
  const session = await auth();

  return session?.user;
};

export const signUpUser = async (
  email: string,
  password: string,
  displayName: string
) => {
  let success = false;
  let err: any;

  try {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    await addUser({ email, password: hashedPassword, displayName });
    success = true;
  } catch (error: any) {
    err = error;
  }

  if (success) {
    redirect("/auth/login");
  } else {
    if (err.message && err.message.includes("UNIQUE")) {
      if (err.message.includes("users.email")) {
        return { error: "Email already registered" };
      } else {
        return { error: "Display name already registered" };
      }
    } else {
      return { error: "Something went wrong" };
    }
  }
};

// export const profileUpdate = async (id: string, displayName: string) => {
//   let success = false;
//   let err: any;
//   try {
//     await updateUserDisplayName(id, displayName);
//     success = true;
//   } catch (error: any) {
//     err = error;
//   }
//
//   if (success) {
//     redirect("/");
//   } else {
//     if (err.message.includes("UNIQUE")) {
//       if (err.message.includes("users.email")) {
//         return { error: "Email already registered" };
//       } else {
//         return { error: "Display name already registered" };
//       }
//     }
//     return { error: "Something went wrong" };
//   }
// };

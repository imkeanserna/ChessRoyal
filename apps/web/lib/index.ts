"use server";

import bcrypt from "bcrypt";
import { addUser } from "@repo/db/user";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export const currentUser = async () => {
  const session = await getServerSession(authOptions);

  return session?.user;
};

export const signUpUser = async (
  email: string,
  password: string,
  displayName: string
): Promise<any> => {
  let success = false;
  let err: any;
  let user: { email: string; password: string | null } | null = null;

  try {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    user = await addUser({ email, password: hashedPassword, displayName });
    success = true;
  } catch (error: any) {
    err = error;
  }

  if (success) {
    return {
      success: true,
      user: user,
    };
  } else {
    if (err.message) {
      if (err.message === "Email already registered") {
        return { error: "Email already registered" };
      } else {
        return { error: "Display name already registered" };
      }
    } else {
      return { error: "Something went wrong" };
    }
  }
};

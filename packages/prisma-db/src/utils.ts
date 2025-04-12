import { db } from "./server/index";

interface IAddUser {
  email: string;
  displayName?: string;
  password?: string;
  image?: string;
}

export const getUserByEmail = async (email: string) => {
  const result = await db.user.findUnique({
    where: { email }
  });
  return result ?? null;
};

const getUserByDisplayName = async (displayName: string) => {
  const result = await db.user.findMany({
    where: { displayName }
  });
  return result ?? null;
};

export const addUser = async ({
  email,
  displayName,
  password,
  image,
}: IAddUser) => {
  try {
    const isUserExist = await getUserByEmail(email);

    if (isUserExist) {
      if (isUserExist.displayName === displayName) {
        throw new Error("Display name already registered");
      }
      throw new Error("Email already registered");
    }

    const isDisplayNameExist = await getUserByDisplayName(displayName!);

    if (isDisplayNameExist.length > 0) {
      throw new Error("Display name already registered");
    }

    const user = await db.user.create({
      data: {
        email,
        displayName: displayName || email.split('@')[0],
        password,
        image
      },
    });
    return {
      email: user.email,
      password: user.password,
    };
  } catch (error) {
    console.error("Error in addUser:", error);
    throw error;
  }
};

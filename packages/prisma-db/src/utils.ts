import db from "./index";

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

export const addUser = async ({
  email,
  displayName,
  password,
  image,
}: IAddUser) => {
  try {
    const user = await db.user.create({
      data: {
        email,
        displayName: displayName || email.split('@')[0], // Fallback to email username if no display name
        password,
        image
      },
    });
    return user;
  } catch (error) {
    console.error("Error in addUser:", error);
    throw error;
  }
};

import db from "./index";

interface IAddUser {
  email: string;
  displayName?: string;
  password?: string;
}

export const getUserByEmail = async (email: string) => {
  const result = await db.user.findUnique({ where: { email } });

  return result ?? null;
};

export const addUser = async ({
  email,
  displayName,
  password
}: IAddUser) => {
  await db.user.create({
    data: {
      email,
      password,
      displayName,
    },
  });
};

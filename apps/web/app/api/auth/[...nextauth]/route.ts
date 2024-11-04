import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { LoginSchema } from "@repo/ui/schema";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { addUser, getUserByEmail } from "@repo/db/user";
import { type NextAuthOptions } from "next-auth";

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Credentials({
      id: "credentials",
      name: "Credentials",
      type: "credentials",
      credentials: {
        email: {},
        password: {},
      },

      authorize: async (credentials) => {
        const validatedCredentials = LoginSchema.safeParse(credentials);

        if (validatedCredentials.success) {
          const { email, password } = validatedCredentials.data;
          try {
            const existingUser = await getUserByEmail(email);

            if (!existingUser || !existingUser.password) {
              return null;
            }

            const isPasswordMatching = bcrypt.compareSync(
              password,
              existingUser.password
            );

            if (!isPasswordMatching) {
              return null;
            }

            return existingUser;
          } catch (error) {
            return null;
          }
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token.email && session.user) {
        if (token.name) {
          session.user.name = token.name;
        }
        if (token.id) {
          session.user.id = token.id as string;
        }
      }

      return session;
    },
    async jwt({ token }) {
      if (!token.email) return token;

      const existingUser = await getUserByEmail(token.email);

      if (!existingUser) return token;

      token.id = existingUser.id;
      token.name = existingUser.displayName;

      return token;
    },
    async signIn({ user, account }) {
      const email = user.email;
      const profileName = user.name;

      if (!email) {
        return false;
      }

      const existingUser = await getUserByEmail(email);

      if (!existingUser) {
        // For OAuth providers (Google/GitHub)
        if (account && account.provider !== "credentials") {
          try {
            await addUser({
              email: email,
              displayName: user.name || profileName || email.split('@')[0], // Fallback to email username if no name
            });
            return true;
          } catch (error) {
            console.error("Error creating user:", error);
            return false;
          }
        }
        // For credentials provider
        await addUser({
          email: email
        });
      } else {
        // Prevent OAuth sign-in if user exists with password
        if (existingUser.password && account?.provider !== "credentials") {
          return false;
        }
      }

      return true;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
};


const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

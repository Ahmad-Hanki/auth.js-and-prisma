// auth.ts

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { prisma } from "./prisma";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    GitHub,
    Google,
    Credentials({
      credentials: {
        email: {},
        password: {},
        // can get more data like phone number and so on
      },
      async authorize(credentials) {
        // check the information
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });
        if (!user) {
          throw new Error("Invalid credentials");
        }

        if (
          credentials.email === user.email &&
          credentials.password === user.password
        ) {
          return user;
        }
        throw new Error("Invalid credentials");
      },
    }),
  ],
});

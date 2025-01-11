// auth.ts
import {v4 as uuid} from "uuid";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { prisma } from "./prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { ValidateScheme } from "./scheme";
import { encode as defaultEncode } from "next-auth/jwt";

const adapter = PrismaAdapter(prisma);

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: adapter,
  providers: [
    GitHub,
    Google,
    Credentials({
      credentials: {
        email: {},
        password: {},
        // can get more data like phone number and so on
      },


      // credentials functions
      
      async authorize(credentials) {
        // check the information
        const validatedCredentials = ValidateScheme.parse(credentials);

        if (!validatedCredentials) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: validatedCredentials.email as string,
            password: validatedCredentials.password as string,
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
  // just add those to methods if you wanna use jwt

  callbacks: {
    async jwt({ token, account }) {
      if (account?.provider === "credentials") {
        token.credentials = true;
      }
      return token;
    },
  },

  jwt: {
    encode: async function (params) {
      if (params.token?.credentials) {
        const sessionToken = uuid();

        if (!params.token.sub) {
          throw new Error("No user ID found in token");
        }

        const createdSession = await adapter?.createSession?.({
          sessionToken: sessionToken,
          userId: params.token.sub,
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // seven days
        });

        if (!createdSession) {
          throw new Error("Failed to create session");
        }

        return sessionToken;
      }
      return defaultEncode(params);
    },
  },
});

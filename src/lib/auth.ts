// auth.ts

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    GitHub,
    Credentials({
      credentials: {
        email: {},
        password: {},
        // can get more data like phone number and so on
      },
      async authorize(credentials) {
        // check the information
        const email = "itxti909@gmail.com";
        const password = "1234";
        if (credentials.email === email && credentials.password === password) {
          return { email, password };
        }
        throw new Error("Invalid credentials");
      },
    }),
  ],
});

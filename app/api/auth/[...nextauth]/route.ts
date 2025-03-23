import NextAuth from "next-auth/next"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import prisma from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async signIn({ user, account }) {
      console.log("User:", user);
      console.log("Account:", account);

      if (!account) {
        console.error("No account information available");
        throw new Error("No account information available");
      }

      // Verifica si el usuario ya existe en la base de datos
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email as string },
      });

      console.log("Existing User:", existingUser);

      // Si el usuario no existe, créalo
      if (!existingUser) {
        const newUser = await prisma.user.create({
          data: {
            name: user.name as string,
            email: user.email as string,
            image: user.image as string,
          },
        });

        console.log("New User Created:", newUser);

        // Crea la entrada en la tabla Account
        try {
          await prisma.account.create({
            data: {
              userId: newUser.id,
              type: account.type as string,
              provider: account.provider as string,
              providerAccountId: account.providerAccountId || account.id as string,
            },
          });
          console.log("Account Created for New User");
        } catch (error) {
          console.error("Error creating account for new user:", error);
        }
      } else {
        // Crea la entrada en la tabla Account si no existe
        const accountExists = await prisma.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: account.provider as string,
              providerAccountId: account.providerAccountId || account.id as string,
            },
          },
        });

        console.log("Account Exists:", accountExists);

        if (!accountExists) {
          try {
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type as string,
                provider: account.provider as string,
                providerAccountId: account.providerAccountId || account.id as string,
              },
            });
            console.log("Account Created for Existing User");
          } catch (error) {
            console.error("Error creating account for existing user:", error);
          }
        }
      }

      return true; // Permite el inicio de sesión
    },
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    }
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST } 
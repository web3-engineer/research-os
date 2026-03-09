import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { clientPromise } from "@/src/lib/db";
import { MongoClient } from "mongodb";

export const authOptions: NextAuthOptions = {
    adapter: MongoDBAdapter(clientPromise),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            checks: ['none'],
        }),
    ],
    session: { strategy: "jwt" },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                // @ts-ignore
                token.role = user.role || "student";
            }
            if (trigger === "update" && session) return { ...token, ...session };
            return token;
        },
        async session({ session, token }) {
            if (session?.user && token.email) {
                const client = (await clientPromise) as MongoClient;
                const db = client.db();
                const dbUser = await db.collection("User").findOne({ email: token.email });
                if (dbUser) {
                    session.user.name = dbUser.name || session.user.name;
                    session.user.image = dbUser.image || session.user.image;
                    // @ts-ignore
                    session.user.role = dbUser.role || "student";
                    // @ts-ignore
                    session.user.course = dbUser.course || "";
                    // @ts-ignore
                    session.user.isAdmin = dbUser.email === "[EMAIL_ADDRESS]";
                }
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
};
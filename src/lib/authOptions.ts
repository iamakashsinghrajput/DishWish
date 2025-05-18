/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextAuthOptions, DefaultSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/db';
import UserModel from '@/models/User';

// Extend the default Session interface to include id, provider, emailVerified
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      provider: string;
      emailVerified?: Date;
    } & DefaultSession['user'];
  }
  interface User {
    id: string;
    emailVerified?: Date;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" },
        loginType: { label: "Login Type", type: "text" }
      },
      async authorize(credentials) {
        await dbConnect();
        if (!credentials?.email) return null;

        const user = await UserModel.findOne({ email: credentials.email.toLowerCase() }) as unknown;
        if (!user) return null;

        if (credentials.loginType === 'otp') {
          if ((user as any).otp === credentials.otp && (user as any).otpExpires && (user as any).otpExpires > new Date()) {
            (user as any).otp = undefined;
            (user as any).otpExpires = undefined;
            if (!(user as any).emailVerified) (user as any).emailVerified = new Date();
            await (user as any).save();
            return { id: (user as any)._id.toString(), email: (user as any).email, name: `${(user as any).firstName} ${(user as any).lastName}`, image: (user as any).image, emailVerified: (user as any).emailVerified };
          }
          return null;
        } else {
          if (!(user as any).password) return null;
          const isPasswordMatch = await (user as any).comparePassword(credentials.password);
          if (isPasswordMatch) {
            if (!(user as any).emailVerified) {
              // You can add logic here if needed
            }
            return { id: (user as any)._id.toString(), email: (user as any).email, name: `${(user as any).firstName} ${(user as any).lastName}`, image: (user as any).image, emailVerified: (user as any).emailVerified };
          }
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        token.id = user.id;
        token.provider = account.provider;
      }
      if (user && 'emailVerified' in user) {
        token.emailVerified = (user as { emailVerified?: Date }).emailVerified;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.provider = token.provider as string;
      session.user.emailVerified = token.emailVerified as Date;
      return session;
    },
    async signIn({ user, account, profile }) {
      await dbConnect();
      if (account?.provider === 'google') {
        const existingUser = await UserModel.findOne({ email: user.email!.toLowerCase() });
        if (existingUser) {
          if (!existingUser.provider || existingUser.provider !== 'google') {
            existingUser.provider = 'google';
            if (profile && 'given_name' in profile && profile.given_name) existingUser.firstName = profile.given_name as string;
            if (profile && 'family_name' in profile && profile.family_name) existingUser.lastName = profile.family_name as string;
            if (user.image && existingUser.image !== user.image) existingUser.image = user.image; // Update image if changed
            existingUser.emailVerified = new Date();
            await existingUser.save();
          }
          return true;
        } else {
          let firstName = user.name?.split(' ')[0] || 'User';
          let lastName = user.name?.split(' ').slice(1).join(' ');
          if (profile && 'given_name' in profile && profile.given_name) firstName = profile.given_name as string;
          if (profile && 'family_name' in profile && profile.family_name) lastName = profile.family_name as string;

          await UserModel.create({
            email: user.email!.toLowerCase(),
            firstName: firstName,
            lastName: lastName || undefined,
            image: user.image,
            provider: 'google',
            emailVerified: new Date(),
          });
          return true;
        }
      }
      return true;
    },
  },
  pages: {
    signIn: '/session/new', // Your custom login page
  },
  secret: process.env.NEXTAUTH_SECRET,
};

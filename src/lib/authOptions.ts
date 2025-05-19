/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextAuthOptions, DefaultSession, Profile, Account, Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from './db';
import UserModel, { IUser } from '../models/User';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

// Augment NextAuth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      provider?: string;
      emailVerified?: Date | string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    firstName?: string;
    lastName?: string;
    emailVerified?: Date;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    provider?: string;
    emailVerified?: Date | string;
  }
}

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is not defined`);
  }
  return value;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: getEnvVar('GOOGLE_CLIENT_ID'),
      clientSecret: getEnvVar('GOOGLE_CLIENT_SECRET'),
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" },
        loginType: { label: "Login Type", type: "text" }
      },
      async authorize(credentials): Promise<any | null> {
        try {
          await dbConnect();
          if (!credentials?.email) return null;

          const dbUser: IUser | null = await UserModel.findOne({ email: credentials.email.toLowerCase() });
          if (!dbUser) return null;

          if (credentials.loginType === 'otp') {
            if (!dbUser.otp || !dbUser.otpExpires) return null;

            const isOtpValid = await bcrypt.compare(credentials.otp, dbUser.otp);

            if (isOtpValid && dbUser.otpExpires > new Date()) {
              dbUser.otp = undefined;
              dbUser.otpExpires = undefined;
              if (!dbUser.emailVerified) dbUser.emailVerified = new Date();
              await dbUser.save();
              return {
                id: (dbUser._id as mongoose.Types.ObjectId).toString(),
                email: dbUser.email,
                name: `${dbUser.firstName || ''} ${dbUser.lastName || ''}`.trim() || dbUser.email,
                image: dbUser.image,
                emailVerified: dbUser.emailVerified,
                firstName: dbUser.firstName,
                lastName: dbUser.lastName,
              };
            }
            return null;
          } else {
            if (!dbUser.password) return null;
            const isPasswordMatch = await dbUser.comparePassword(credentials.password);
            if (isPasswordMatch) {
              return {
                id: (dbUser._id as mongoose.Types.ObjectId).toString(),
                email: dbUser.email,
                name: `${dbUser.firstName || ''} ${dbUser.lastName || ''}`.trim() || dbUser.email,
                image: dbUser.image,
                emailVerified: dbUser.emailVerified,
                firstName: dbUser.firstName,
                lastName: dbUser.lastName,
              };
            }
            return null;
          }
        } catch (error) {
          console.error('Authorize error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }: { user: any; account: Account | null; profile?: Profile }): Promise<boolean | string> {
      try {
        await dbConnect();
        if (account?.provider === 'google') {
          const dbUser = await UserModel.findOne({ email: user.email.toLowerCase() });

          if (dbUser) {
            let updated = false;
            if (!dbUser.provider || dbUser.provider !== 'google') {
              dbUser.provider = 'google';
              updated = true;
            }
            const googleFirstName = (profile as any)?.given_name;
            const googleLastName = (profile as any)?.family_name;

            if (googleFirstName && dbUser.firstName !== googleFirstName) {
              dbUser.firstName = googleFirstName;
              updated = true;
            }
            if (googleLastName && dbUser.lastName !== googleLastName) {
              dbUser.lastName = googleLastName;
              updated = true;
            } else if (googleFirstName && !dbUser.lastName && user.name && user.name !== googleFirstName) {
               const nameParts = user.name.split(' ');
               if (nameParts.length > 1 && nameParts[0] === googleFirstName) {
                   dbUser.lastName = nameParts.slice(1).join(' ');
                   updated = true;
               }
            }
            if (user.image && dbUser.image !== user.image) {
              dbUser.image = user.image;
              updated = true;
            }
            if (!dbUser.emailVerified) {
              dbUser.emailVerified = new Date();
              updated = true;
            }
            if(updated) await dbUser.save();
            user.id = (dbUser._id as mongoose.Types.ObjectId).toString();
            user.emailVerified = dbUser.emailVerified;
            user.firstName = dbUser.firstName;
            user.lastName = dbUser.lastName;
          } else {
            const firstName = (profile as any)?.given_name || user.name?.split(' ')[0] || 'User';
            const lastName = (profile as any)?.family_name || user.name?.split(' ').slice(1).join(' ') || undefined;

            const newDbUser = await UserModel.create({
              email: user.email.toLowerCase(),
              firstName: firstName,
              lastName: lastName,
              image: user.image,
              provider: 'google',
              emailVerified: new Date(),
            });
            user.id = (newDbUser._id as mongoose.Types.ObjectId).toString();
            user.emailVerified = newDbUser.emailVerified;
            user.firstName = newDbUser.firstName;
            user.lastName = newDbUser.lastName;
          }
        } else if (account?.provider === 'credentials') {
          if (!user.id || !mongoose.Types.ObjectId.isValid(user.id)) {
              console.error("Credentials signIn: user.id from authorize is not a valid MongoDB ObjectId.", user);
              const dbUserCheck = await UserModel.findOne({email: user.email?.toLowerCase()});
              if (dbUserCheck) {
                  user.id = (dbUserCheck._id as mongoose.Types.ObjectId).toString();
                  user.emailVerified = dbUserCheck.emailVerified;
                  user.firstName = dbUserCheck.firstName;
                  user.lastName = dbUserCheck.lastName;
              } else {
                  console.error("Credentials signIn: Could not re-verify user from DB during signIn callback.");
                  return false;
              }
          }
        }
        return true;
      } catch (error) {
        console.error('signIn callback error:', error);
        return false;
      }
    },
    async jwt({ token, user, account }: { token: JWT; user?: any; account?: Account | null; profile?: Profile }): Promise<JWT> {
      if (user) {
        token.id = user.id;
        if (account) {
          token.provider = account.provider;
        }
        if (user.emailVerified) {
          token.emailVerified = user.emailVerified instanceof Date ? user.emailVerified.toISOString() : user.emailVerified;
        }
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT; user: any }): Promise<Session> {
      session.user.id = token.id;
      session.user.provider = token.provider;
      if (token.emailVerified) {
        session.user.emailVerified = new Date(token.emailVerified as string);
      }
      return session;
    },
  },
  pages: {
    signIn: '/session/new',
  },
  secret: getEnvVar('NEXTAUTH_SECRET'),
};

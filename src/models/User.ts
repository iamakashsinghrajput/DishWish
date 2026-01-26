// /* eslint-disable @typescript-eslint/no-explicit-any */
// import mongoose, { Document, Model, Schema } from 'mongoose';
// import bcrypt from 'bcryptjs';

// export interface IUser extends Document {
//   firstName?: string;
//   lastName?: string;
//   email: string;
//   password?: string;
//   emailVerified?: Date;
//   image?: string;
//   provider?: 'google' | 'credentials' | 'email';
//   otp?: string;
//   otpExpires?: Date;
//   passwordResetToken?: string;
//   passwordResetExpires?: Date;
//   createdAt: Date;
//   updatedAt: Date;
//   comparePassword(candidatePassword: string): Promise<boolean>;
// }

// const UserSchema: Schema<IUser> = new Schema({
//   firstName: { type: String },
//   lastName: { type: String },
//   email: { type: String, required: true, unique: true, lowercase: true, trim: true },
//   password: { type: String },
//   emailVerified: { type: Date },
//   image: { type: String },
//   provider: { type: String, default: 'credentials' },
//   otp: { type: String },
//   otpExpires: { type: Date },
//   passwordResetToken: { type: String },
//   passwordResetExpires: { type: Date },
// }, { timestamps: true });

// UserSchema.pre<IUser>('save', async function (next) {
//   if (!this.isModified('password') || !this.password) {
//     return next();
//   }
//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (err: any) {
//     next(err);
//   }
// });

// UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
//   if (!this.password) return false;
//   return bcrypt.compare(candidatePassword, this.password);
// };

// const UserModel: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

// export default UserModel;



// src/models/User.ts
import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: Types.ObjectId; // Explicitly define _id
  firstName?: string;
  lastName?: string;
  email: string;
  password?: string;
  emailVerified?: Date;
  image?: string;
  provider?: 'google' | 'credentials' | 'email';
  otp?: string;
  otpExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String },
  emailVerified: { type: Date },
  image: { type: String },
  provider: { type: String, default: 'credentials' },
  otp: { type: String },
  otpExpires: { type: Date },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
}, { timestamps: true });

UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    next(err);
  }
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

const UserModel: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default UserModel;
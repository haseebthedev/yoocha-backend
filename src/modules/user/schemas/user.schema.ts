import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNotEmpty, IsString } from 'class-validator';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from 'src/common/schemas';
import * as bcrypt from 'bcrypt';

@Schema()
export class User extends BaseSchema {
  @Prop({ default: null })
  @IsString()
  profilePicture: string;

  @Prop({ default: null })
  @IsNotEmpty()
  firstname: string;

  @Prop({ default: null })
  @IsNotEmpty()
  lastname: string;

  @Prop({ unique: true, lowercase: true })
  @IsNotEmpty()
  email: string;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop()
  @IsString()
  @IsNotEmpty()
  password: string;

  @Prop({ default: null })
  authCode: string;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User).set('versionKey', false);

// If password is changed or this is a new user, generate hash
UserSchema.pre('save', async function (next) {
  const user = this as UserDocument;
  if (user.isModified('password') || user.isNew) {
    const hash = await bcrypt.hash(user.password, 10);
    user.password = hash;
  }
  next();
});

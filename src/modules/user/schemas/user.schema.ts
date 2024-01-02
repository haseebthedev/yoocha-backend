import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as argon from 'argon2';
import { IsNotEmpty } from 'class-validator';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from 'src/common/schemas';

@Schema()
export class User extends BaseSchema {
  @Prop({ default: null })
  @IsNotEmpty()
  firstname: string;

  @Prop({ default: null })
  @IsNotEmpty()
  lastname: string;

  @Prop({ unique: true })
  @IsNotEmpty()
  email: string;

  @Prop()
  password: string;

  @Prop({ default: null })
  authCode: string;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User).set(
  'versionKey',
  false,
);

UserSchema.pre('save', async function (next) {
  const user = this as UserDocument;

  // If password is changed or this is a new user, generate hash
  if (user.isModified('password') || user.isNew) {
    const hashedPassword = await argon.hash(user.password);
    user.password = hashedPassword;
  }
  next();
});

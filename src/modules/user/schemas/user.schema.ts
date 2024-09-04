import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from 'src/common/schemas';
import * as Paginate from 'mongoose-paginate-v2';
import * as bcrypt from 'bcrypt';
import { AccountStatus } from 'src/common/enums/user.enum';

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

  @Prop({ default: null })
  @IsDateString()
  dateOfBirth: string;

  @Prop({ default: null })
  @IsNotEmpty()
  city: string;

  @Prop({ default: null })
  @IsNotEmpty()
  country: string;

  @Prop({ type: Boolean, default: true })
  @IsBoolean()
  isFirstSignIn: boolean;

  @Prop({ type: String, enum: AccountStatus, required: true })
  @IsEnum(AccountStatus)
  accountStatus: AccountStatus;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User)
  .set('toJSON', {
    transform: function (doc, ret, opt) {
      delete ret['password'];
      delete ret['authCode'];
      return ret;
    },
  })
  .set('versionKey', false);

// If password is changed or this is a new user, generate hash
UserSchema.pre('save', async function (next) {
  const user = this as UserDocument;
  if (user.isModified('password') || user.isNew) {
    const hash = await bcrypt.hash(user.password, 10);
    user.password = hash;
  }
  next();
});

UserSchema.plugin(Paginate);

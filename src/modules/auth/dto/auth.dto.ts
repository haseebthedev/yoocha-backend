import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AccountStatus } from 'src/common/enums/user.enum';

export class SignInDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  fcmToken: string;
}

export class SignUpDTO {
  @IsString()
  @IsNotEmpty()
  firstname: string;

  @IsString()
  @IsNotEmpty()
  lastname: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(AccountStatus)
  @IsOptional()
  accountStatus?: AccountStatus;
}

export class ForgotPassDTO {
  @IsString()
  email: string;
}

export class ResetPassDTO {
  @IsString()
  email: string;

  @IsString()
  authCode: string;

  @IsString()
  newPassword: string;
}

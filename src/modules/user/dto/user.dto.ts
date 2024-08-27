import { IsBoolean, IsDateString, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AccountStatus } from 'src/common/enums/user.enum';

export class ChangePassDTO {
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

export class UpdateProfileDTO {
  @IsString()
  @IsOptional()
  profilePicture: string;

  @IsString()
  @IsOptional()
  firstname: string;

  @IsString()
  @IsOptional()
  lastname: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth: string;

  @IsString()
  @IsOptional()
  country: string;

  @IsEnum(AccountStatus)
  @IsOptional()
  accountStatus?: AccountStatus;

  @IsOptional()
  @IsBoolean()
  isFirstSignIn?: boolean;
}

export class ContactUsDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}

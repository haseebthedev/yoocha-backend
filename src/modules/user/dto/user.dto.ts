import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
}

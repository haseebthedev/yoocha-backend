import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ParticipantType } from 'src/common/enums/user.enum';

export class ListUserRequestsDto {
  @IsNotEmpty()
  @IsEnum(ParticipantType, {
    message: `role must be either ${Object.values(ParticipantType).join(', ')}`,
  })
  role: string;
}

export class SendMessagePayloadDto {
  @IsString()
  @IsOptional()
  message?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  files?: string[];

  @IsEnum(['text', 'image'])
  @IsOptional()
  type?: 'text' | 'image';
}

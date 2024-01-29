import { Injectable, PipeTransform, ArgumentMetadata, BadRequestException, HttpStatus } from '@nestjs/common';
import { Types } from 'mongoose';
import { CustomError } from '../errors/api.error';
import { ErrorMessage } from '../enums/error.enum';

@Injectable()
export class MongoIdValidationPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    const isValidObjectId = Types.ObjectId.isValid(value);
    if (!isValidObjectId) {
      throw new CustomError(ErrorMessage.INVALID_MONGO_ID, HttpStatus.BAD_REQUEST);
    }
    return value;
  }
}

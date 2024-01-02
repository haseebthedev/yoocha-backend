import { Prop } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export class BaseSchema {
  _id: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

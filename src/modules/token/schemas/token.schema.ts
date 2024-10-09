import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNotEmpty, IsString } from 'class-validator';
import { HydratedDocument, Types } from 'mongoose';
import { BaseSchema } from 'src/common/schemas';
import * as Paginate from 'mongoose-paginate-v2';

@Schema()
export class Token extends BaseSchema {
  @Prop({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  token: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }) // 30 days from now
  expiresAt: Date;
}

export type TokenDocument = HydratedDocument<Token>;
export const TokenSchema = SchemaFactory.createForClass(Token).set('versionKey', false);

TokenSchema.plugin(Paginate);

TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

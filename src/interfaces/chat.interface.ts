import { Types } from 'mongoose';

export interface ParticipantI {
  user: Types.ObjectId;
  role: string;
}

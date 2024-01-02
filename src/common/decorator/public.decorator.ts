import { SetMetadata } from '@nestjs/common';

/** This is a custom decorator that we'll use to make certain
 * endpoints publically available without having the authentication
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

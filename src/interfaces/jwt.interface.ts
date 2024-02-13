export interface JWTDecodedUserI {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

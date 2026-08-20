export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export type JwtPayload = {
  sub: string;
  email: string;
};

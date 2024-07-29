import * as jwt from 'jsonwebtoken';
import { JwtPayload } from '../type/jwt';

const JWT_SECRET: string = process.env.JWT_SECRET as string;

export const generateToken = (
  payload: JwtPayload,
  expiresIn: string,
): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn });
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    throw new Error('유효하지 않은 토큰입니다.');
  }
};

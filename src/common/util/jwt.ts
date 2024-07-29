import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from '../type/jwt';

const jwtService: JwtService = new JwtService({});
const configService: ConfigService = new ConfigService();
const secret: string = configService.get<string>('JWT_SECRET');

export const generateToken = (
  payload: JwtPayload,
  expiresIn: string,
): string => {
  return jwtService.sign(payload, { secret, expiresIn });
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwtService.verify(token, { secret }) as JwtPayload;
  } catch (error) {
    throw new UnauthorizedException('유효하지 않은 토큰입니다.');
  }
};

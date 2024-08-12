import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from './repository/user.repository';
import { JwtPayload, JwtToken } from '../common/type/jwt.type';
import { generateToken, verifyToken } from '../common/util/jwt';
import { RequestSignupDto } from './dto/request-signup.dto';
import { CustomError } from '../common/error/custom-error';

@Injectable()
export class UserService {
  private emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private phoneNumberRegex = /^010\d{8}$/;

  constructor(private readonly userRepository: UserRepository) {}

  /** 회원가입 시 유저 입력값 검증 */
  public validateUserInput(
    nickname: string,
    email?: string,
    phoneNumber?: string,
  ): void {
    if (!nickname) {
      throw new CustomError('error', '닉네임이 제공되지 않았습니다.');
    }

    if (!email && !phoneNumber) {
      throw new CustomError(
        'error',
        '이메일 또는 휴대폰 번호가 제공되지 않았습니다.',
      );
    }

    if (email && !this.emailRegex.test(email)) {
      throw new CustomError('error', '유효한 이메일 형식이 아닙니다.');
    }

    if (phoneNumber && !this.phoneNumberRegex.test(phoneNumber)) {
      throw new CustomError('error', '유효한 휴대폰 번호 형식이 아닙니다.');
    }
  }

  /** 이미 가입한 유저인지 확인 */
  public async checkExistingUser(
    email?: string,
    phoneNumber?: string,
    nickname?: string,
  ): Promise<void> {
    const existingUser: User | null = await this.userRepository.findUser({
      email,
      phoneNumber,
      nickname,
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new CustomError('error', '이미 가입한 이메일입니다.');
      }
      if (existingUser.phoneNumber === phoneNumber) {
        throw new CustomError('error', '이미 가입한 휴대폰 번호입니다.');
      }
      if (existingUser.nickname === nickname) {
        throw new CustomError('error', '이미 사용 중인 닉네임입니다.');
      }
    }
  }

  /** 유저 생성 */
  public async signup(args: RequestSignupDto): Promise<User> {
    const hashedPassword: string = await bcrypt.hash(args.password, 10);
    const userData: Prisma.UserCreateInput = {
      email: args.email || null,
      phoneNumber: args.phoneNumber || null,
      password: hashedPassword,
      fullName: args.fullName,
      nickname: args.nickname,
    };
    return this.userRepository.createUser(userData);
  }

  /** 로그인 */
  public async login(
    password: string,
    email?: string,
    phoneNumber?: string,
  ): Promise<JwtToken> {
    const user: User | null = await this.userRepository.findUser({
      email,
      phoneNumber,
    });

    if (!user) {
      throw new CustomError('error', '해당 유저를 찾을 수 없습니다.');
    }

    const isPasswordValid: boolean = await bcrypt.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new CustomError('error', '비밀번호가 일치하지 않습니다.');
    }

    // JWT 페이로드 생성
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
    };

    // JWT 액세스 토큰 발급
    const accessToken: string = generateToken(payload, '1h');

    // JWT 리프레시 토큰 발급
    const refreshToken: string = generateToken(payload, '7d');

    // 리프레시 토큰을 데이터베이스에 저장
    await this.userRepository.saveRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  /** 리프레시 토큰을 사용하여 새로운 액세스 토큰 발급 */
  public async refreshAccessToken(refreshToken: string): Promise<JwtToken> {
    try {
      const payload: JwtPayload = verifyToken(refreshToken);
      const storedUser: User | null =
        await this.userRepository.findUserWithRefreshToken(
          payload.userId,
          refreshToken,
        );

      if (!storedUser) {
        throw new CustomError('error', '유효하지 않은 리프레시 토큰입니다.');
      }

      const accessToken: string = generateToken(
        {
          userId: payload.userId,
          email: payload.email,
          phoneNumber: payload.phoneNumber,
        },
        '1h',
      );

      return { accessToken };
    } catch (error) {
      throw new CustomError('error', '유효하지 않은 리프레시 토큰입니다.');
    }
  }

  /** 모든 유저 조회 */
  public async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAllUsers();
  }
}

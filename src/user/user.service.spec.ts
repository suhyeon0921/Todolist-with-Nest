import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { UserService } from './user.service';
import { UserRepository } from './repository/user.repository';
import { CustomError } from '../common/error/custom-error';
import { RequestSignupDto } from './dto/request-signup.dto';
import * as jwtUtils from '../common/util/jwt';
import { JwtPayload, JwtToken } from '../common/type/jwt.type';

jest.mock('../common/util/jwt');

describe('UserService', () => {
  let service: UserService;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            findUser: jest.fn(),
            createUser: jest.fn(),
            saveRefreshToken: jest.fn(),
            findUserWithRefreshToken: jest.fn(),
            findAllUsers: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUserInput', () => {
    it('닉네임을 입력하지 않았을 시 에러', () => {
      expect(() => service.validateUserInput('')).toThrowError(CustomError);
    });

    it('휴대폰 번호 또는 이메일을 입력하지 않았을 시 에러', () => {
      expect(() => service.validateUserInput('nickname')).toThrowError(
        CustomError,
      );
    });

    it('이메일 형식이 올바르지 않을 시 에러', () => {
      expect(() =>
        service.validateUserInput('nickname', 'invalid-email'),
      ).toThrowError(CustomError);
    });

    it('휴대폰 번호 형식이 올바르지 않을 시 에러', () => {
      expect(() =>
        service.validateUserInput(
          'nickname',
          undefined,
          'invalid-phone-number',
        ),
      ).toThrowError(CustomError);
    });
  });

  describe('checkExistingUser', () => {
    it('이미 존재하는 이메일일 시 에러', async () => {
      userRepository.findUser = jest
        .fn()
        .mockResolvedValue({ email: 'test@email.com' } as User);
      await expect(
        service.checkExistingUser('test@email.com'),
      ).rejects.toThrowError(CustomError);
    });

    it('이미 존재하는 휴대폰 번호일 시 에러', async () => {
      userRepository.findUser = jest
        .fn()
        .mockResolvedValue({ phoneNumber: '01012345678' } as User);
      await expect(
        service.checkExistingUser(undefined, '01012345678'),
      ).rejects.toThrowError(CustomError);
    });

    it('이미 존재하는 닉네임일 시 에러', async () => {
      userRepository.findUser = jest
        .fn()
        .mockResolvedValue({ nickname: 'nickname' } as User);
      await expect(
        service.checkExistingUser(undefined, undefined, 'nickname'),
      ).rejects.toThrowError(CustomError);
    });
  });

  describe('signup', () => {
    it('유저 생성', async () => {
      const dto: RequestSignupDto = {
        email: 'test@example.com',
        password: 'password',
        fullName: 'Full Name',
        nickname: 'nickname',
      };

      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password' as never);
      jest
        .spyOn(userRepository, 'createUser')
        .mockResolvedValue({ id: 1 } as User);

      const result = await service.signup(dto);
      expect(result).toEqual({ id: 1 });
      expect(userRepository.createUser).toHaveBeenCalledWith({
        email: dto.email,
        phoneNumber: null,
        password: 'hashed-password',
        fullName: dto.fullName,
        nickname: dto.nickname,
      });
    });
  });

  describe('login', () => {
    it('로그인', async () => {
      const user: User = {
        email: 'test@example.com',
        password: 'password',
      } as User;

      jest.spyOn(userRepository, 'findUser').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      (jwtUtils.generateToken as jest.Mock).mockReturnValue('token');

      const result = await service.login('test@example.com', 'password');
      expect(result).toEqual({ accessToken: 'token', refreshToken: 'token' });
    });

    it('해당 유저를 찾을 수 없을 시 에러', async () => {
      jest.spyOn(userRepository, 'findUser').mockResolvedValue(null);

      await expect(
        service.login('test@example.com', 'password'),
      ).rejects.toThrowError(CustomError);
    });

    it('비밀번호가 일치하지 않을 시 에러', async () => {
      const user: User = {
        email: 'test@example.com',
        password: 'password',
      } as User;

      jest.spyOn(userRepository, 'findUser').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(
        service.login('test@example.com', 'invalid-password'),
      ).rejects.toThrowError(CustomError);
    });
  });

  describe('refreshAccessToken', () => {
    it('새로운 액세스 토큰 발급', async () => {
      const user: User = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed-password',
        phoneNumber: null,
        fullName: 'Full Name',
        nickname: 'nickname',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        refreshToken: 'refresh-token',
      };
      const payload: JwtPayload = {
        userId: user.id,
        email: user.email,
      };

      (jwtUtils.verifyToken as jest.Mock).mockReturnValue(payload);
      jest
        .spyOn(userRepository, 'findUserWithRefreshToken')
        .mockResolvedValue(user);
      (jwtUtils.generateToken as jest.Mock).mockReturnValue('new-access-token');

      const result: JwtToken =
        await service.refreshAccessToken('refresh-token');
      expect(result).toEqual({ accessToken: 'new-access-token' });
    });

    it('리프레시 토큰이 유효하지 않을 시 에러', async () => {
      (jwtUtils.verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(
        service.refreshAccessToken('invalid-refresh-token'),
      ).rejects.toThrowError(CustomError);
    });

    it('리프레시 토큰을 사용하여 유저를 찾을 수 없을 시 에러', async () => {
      const payload: JwtPayload = {
        userId: 1,
        email: 'test@example.com',
        phoneNumber: null,
      };

      (jwtUtils.verifyToken as jest.Mock).mockReturnValue(payload);
      jest
        .spyOn(userRepository, 'findUserWithRefreshToken')
        .mockResolvedValue(null);

      await expect(
        service.refreshAccessToken('refresh-token'),
      ).rejects.toThrowError(CustomError);
    });
  });

  describe('findAllUsers', () => {
    it('모든 유저 반환', async () => {
      const users: User[] = [
        {
          id: 1,
          email: 'test1@example.com',
          password: 'password',
          phoneNumber: null,
          fullName: 'Full Name 1',
          nickname: 'nickname1',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          refreshToken: null,
        },
        {
          id: 2,
          email: 'test2@example.com',
          password: 'password',
          phoneNumber: null,
          fullName: 'Full Name 2',
          nickname: 'nickname2',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          refreshToken: null,
        },
      ];

      jest.spyOn(userRepository, 'findAllUsers').mockResolvedValue(users);

      const result = await service.getAllUsers();
      expect(result).toEqual(users);
    });
  });
});

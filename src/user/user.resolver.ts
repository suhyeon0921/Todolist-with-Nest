import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Response } from 'express';
import { UserService } from './user.service';
import { RequestSignupDto } from './dto/request-signup.dto';
import { RequestLoginDto } from './dto/request-login.dto';
import { RequestRefreshAccessTokenDto } from './dto/request-refresh-access-token.dto';
import { CustomError } from '../common/error/custom-error';
import { UserResponseType } from '../common/type/user-response.type';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => UserResponseType)
  async signup(
    @Args('data') args: RequestSignupDto,
  ): Promise<typeof UserResponseType> {
    try {
      this.userService.validateUserInput(
        args.nickname,
        args.email,
        args.phoneNumber,
      );
      await this.userService.checkExistingUser(
        args.email,
        args.phoneNumber,
        args.nickname,
      );
      const user = await this.userService.signup(args);
      return { status: 'ok', data: user };
    } catch (error) {
      throw new CustomError('error', error.message);
    }
  }

  @Mutation(() => UserResponseType)
  async login(
    @Args('data') args: RequestLoginDto,
    @Context() context: { req: Request; res: Response },
  ): Promise<typeof UserResponseType> {
    try {
      const { accessToken, refreshToken } = await this.userService.login(
        args.password,
        args.email,
        args.phoneNumber,
      );

      // 쿠키에 JWT 토큰 저장
      context.res.cookie('accessToken', accessToken, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000, // 1 hour
        domain: 'localhost',
      });

      context.res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        domain: 'localhost',
      });

      return { status: 'ok', jwtToken: { accessToken, refreshToken } };
    } catch (error) {
      throw new CustomError('error', error.message);
    }
  }

  @Mutation(() => UserResponseType)
  async refresh(
    @Args('data') args: RequestRefreshAccessTokenDto,
    @Context() context: { req: Request; res: Response },
  ): Promise<typeof UserResponseType> {
    try {
      const { accessToken } = await this.userService.refreshAccessToken(
        args.refreshToken,
      );

      context.res.cookie('accessToken', accessToken, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000, // 1 hour
        domain: 'localhost',
      });

      return { status: 'ok', jwtToken: { accessToken } };
    } catch (error) {
      throw new CustomError('error', error.message);
    }
  }

  @Query(() => UserResponseType)
  async getAllUsers(): Promise<typeof UserResponseType> {
    try {
      const users = await this.userService.getAllUsers();
      return { status: 'ok', users: users };
    } catch (error) {
      throw new CustomError('error', 'Internal server error');
    }
  }
}

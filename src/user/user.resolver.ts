import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Response } from 'express';
import { UserService } from './user.service';
import { User } from './entity/user.entity';
import { RequestSignupDto } from './dto/request-signup.dto';
import { RequestLoginDto } from './dto/request-login.dto';
import { RequestRefreshAccessTokenDto } from './dto/request-refresh-access-token.dto';
import { JwtToken } from '../common/type/jwt.type';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User)
  async signup(@Args('data') args: RequestSignupDto): Promise<User> {
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
    return this.userService.signup(args);
  }

  @Mutation(() => JwtToken)
  async login(
    @Args('data') args: RequestLoginDto,
    @Context() context: { req: Request; res: Response },
  ): Promise<JwtToken> {
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

    return { accessToken, refreshToken };
  }

  @Mutation(() => JwtToken)
  async refresh(
    @Args('data') args: RequestRefreshAccessTokenDto,
    @Context() context: { req: Request; res: Response },
  ): Promise<JwtToken> {
    const { accessToken } = await this.userService.refreshAccessToken(
      args.refreshToken,
    );

    context.res.cookie('accessToken', accessToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000, // 1 hour
      domain: 'localhost',
    });

    return { accessToken };
  }

  @Query(() => [User])
  async getAllUsers(): Promise<User[]> {
    return this.userService.getAllUsers();
  }
}

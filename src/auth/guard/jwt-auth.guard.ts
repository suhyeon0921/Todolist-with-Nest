import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { verifyToken } from '../../common/util/jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }

  /** JWT 토큰 검증 */
  canActivate(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();
    const token = req.cookies['accessToken'];

    if (!token) {
      throw new UnauthorizedException('토큰이 없습니다.');
    }

    try {
      req.user = verifyToken(token);
    } catch (err) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    return true;
  }
}

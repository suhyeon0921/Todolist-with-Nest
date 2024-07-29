import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/** GraphQL 컨텍스트에서 현재 사용자 정보를 가져오는 데코레이터 */
export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx: GqlExecutionContext = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
  },
);

import { createUnionType, Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../user/entity/user.entity';
import { JwtToken } from './jwt.type';

@ObjectType()
export class UserSuccessResponse {
  @Field(() => String)
  status: 'ok';

  @Field(() => User, { nullable: true })
  data?: User;

  @Field(() => [User], { nullable: true })
  users?: User[];

  @Field(() => JwtToken, { nullable: true })
  jwtToken?: JwtToken;
}

@ObjectType()
export class UserErrorResponse {
  @Field(() => String)
  status: 'error';

  @Field(() => String)
  message: string;
}

export const UserResponseType = createUnionType({
  name: 'UserResponseType',
  types: () => [UserSuccessResponse, UserErrorResponse] as const,
  resolveType(value) {
    if (value.message) {
      return UserErrorResponse;
    }
    return UserSuccessResponse;
  },
});

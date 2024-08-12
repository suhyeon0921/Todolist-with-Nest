import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class JwtToken {
  @Field(() => String)
  accessToken: string;

  @Field(() => String, { nullable: true })
  refreshToken?: string;
}

@ObjectType()
export class JwtPayload {
  @Field(() => Number)
  userId: number;

  @Field(() => String, { nullable: true })
  email?: string | null;

  @Field(() => String, { nullable: true })
  phoneNumber?: string | null;
}

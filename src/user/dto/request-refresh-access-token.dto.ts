import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class RequestRefreshAccessTokenDto {
  @Field(() => String)
  refreshToken: string;
}

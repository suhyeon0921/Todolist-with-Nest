import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class RequestSignupDto {
  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  phoneNumber?: string;

  @Field(() => String)
  password: string;

  @Field(() => String)
  fullName: string;

  @Field(() => String)
  nickname: string;
}

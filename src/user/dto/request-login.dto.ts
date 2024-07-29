import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class RequestLoginDto {
  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  phoneNumber?: string;

  @Field(() => String)
  password: string;
}

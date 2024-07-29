import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserPayload {
  @Field(() => Number)
  userId: number;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  phoneNumber?: string;
}

import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Timestamp } from '../../common/entity/timestamp.entity';

@ObjectType()
export class User extends Timestamp {
  @Field(() => Int)
  id: number;

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

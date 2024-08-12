import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Timestamp } from '../../common/entity/timestamp.entity';
import { User } from '../../user/entity/user.entity';

@ObjectType()
export class Task extends Timestamp {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  content: string;

  @Field(() => Boolean)
  isDone: boolean;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => Int, { nullable: true })
  userId?: number;
}

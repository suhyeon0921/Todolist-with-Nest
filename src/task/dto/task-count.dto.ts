import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TaskCountDto {
  @Field(() => Int)
  completedTaskCount: number;

  @Field(() => Int)
  totalTaskCount: number;
}

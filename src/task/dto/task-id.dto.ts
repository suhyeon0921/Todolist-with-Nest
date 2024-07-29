import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class TaskIdDto {
  @Field(() => Int)
  id: number;
}

import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class RequestUpdateTaskDto {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  content: string;
}

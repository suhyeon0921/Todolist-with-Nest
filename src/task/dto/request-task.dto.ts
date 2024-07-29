import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class RequestTaskDto {
  @Field(() => String)
  content: string;
}

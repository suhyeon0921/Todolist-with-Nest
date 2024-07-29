import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export abstract class Timestamp {
  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date;
}

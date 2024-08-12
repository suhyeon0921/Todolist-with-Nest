import { createUnionType, Field, ObjectType } from '@nestjs/graphql';
import { Task } from '../../task/entity/task.entity';
import { TaskCountDto } from '../../task/dto/task-count.dto';

@ObjectType()
export class TaskSuccessResponse {
  @Field(() => String)
  status: 'ok';

  @Field(() => Task, { nullable: true })
  data?: Task;

  @Field(() => [Task], { nullable: true })
  tasks?: Task[];

  @Field(() => TaskCountDto, { nullable: true })
  taskCount?: TaskCountDto;
}

@ObjectType()
export class TaskErrorResponse {
  @Field(() => String)
  status: 'error';

  @Field(() => String)
  message: string;
}

export const TaskResponseType = createUnionType({
  name: 'TaskResponseType',
  types: () => [TaskSuccessResponse, TaskErrorResponse] as const,
  resolveType(value) {
    if (value.message) {
      return TaskErrorResponse;
    }
    return TaskSuccessResponse;
  },
});

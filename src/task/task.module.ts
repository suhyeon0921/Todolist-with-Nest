import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskResolver } from './task.resolver';
import { TaskRepository } from './repository/task.repository';

@Module({
  providers: [TaskService, TaskResolver, TaskRepository],
})
export class TaskModule {}

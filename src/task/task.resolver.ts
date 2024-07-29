import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TaskService } from './task.service';
import { User } from '../user/entity/user.entity';
import { Task } from './entity/task.entity';
import { TaskCountDto } from './dto/task-count.dto';
import { RequestTaskDto } from './dto/request-task.dto';
import { TaskIdDto } from './dto/task-id.dto';
import { RequestUpdateTaskDto } from './dto/request-update-task.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../auth/decorator/current-user.decorator';

@Resolver(() => Task)
export class TaskResolver {
  constructor(private readonly taskService: TaskService) {}

  @Query(() => [Task])
  @UseGuards(JwtAuthGuard)
  async tasks(@CurrentUser() user: User): Promise<Task[]> {
    return this.taskService.getTasks(user.id);
  }

  @Query(() => TaskCountDto)
  @UseGuards(JwtAuthGuard)
  async taskCount(@CurrentUser() user: User): Promise<TaskCountDto> {
    return this.taskService.getTaskCount(user.id);
  }

  @Mutation(() => Task)
  @UseGuards(JwtAuthGuard)
  async createTask(
    @Args('data') data: RequestTaskDto,
    @CurrentUser() user: User,
  ): Promise<Task> {
    return this.taskService.createTask(data.content, user.id);
  }

  @Mutation(() => Task)
  @UseGuards(JwtAuthGuard)
  async updateTask(
    @Args('data') data: RequestUpdateTaskDto,
    @CurrentUser() user: User,
  ): Promise<Task> {
    return this.taskService.updateTask(data.id, data.content, user.id);
  }

  @Mutation(() => Task)
  @UseGuards(JwtAuthGuard)
  async deleteTask(
    @Args('data') data: TaskIdDto,
    @CurrentUser() user: User,
  ): Promise<Task> {
    return this.taskService.deleteTask(data.id, user.id);
  }

  @Mutation(() => Task)
  @UseGuards(JwtAuthGuard)
  async completeTask(
    @Args('data') data: TaskIdDto,
    @CurrentUser() user: User,
  ): Promise<Task> {
    return this.taskService.completeTask(data.id, user.id);
  }

  @Mutation(() => Task)
  @UseGuards(JwtAuthGuard)
  async uncompleteTask(
    @Args('data') data: TaskIdDto,
    @CurrentUser() user: User,
  ): Promise<Task> {
    return this.taskService.uncompleteTask(data.id, user.id);
  }
}

import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TaskService } from './task.service';
import { User } from '../user/entity/user.entity';
import { RequestTaskDto } from './dto/request-task.dto';
import { TaskIdDto } from './dto/task-id.dto';
import { RequestUpdateTaskDto } from './dto/request-update-task.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { CustomError } from '../common/error/custom-error';
import { TaskResponseType } from '../common/type/task-response.type';

@Resolver()
export class TaskResolver {
  constructor(private readonly taskService: TaskService) {}

  @Query(() => TaskResponseType)
  @UseGuards(JwtAuthGuard)
  async tasks(@CurrentUser() user: User): Promise<typeof TaskResponseType> {
    try {
      const tasks = await this.taskService.getTasks(user.id);
      return { status: 'ok', tasks: tasks };
    } catch (error) {
      throw new CustomError('error', error.message);
    }
  }

  @Query(() => TaskResponseType)
  @UseGuards(JwtAuthGuard)
  async taskCount(@CurrentUser() user: User): Promise<typeof TaskResponseType> {
    try {
      const taskCount = await this.taskService.getTaskCount(user.id);
      return { status: 'ok', taskCount: taskCount };
    } catch (error) {
      throw new CustomError('error', 'Internal server error');
    }
  }

  @Mutation(() => TaskResponseType)
  @UseGuards(JwtAuthGuard)
  async createTask(
    @Args('data') data: RequestTaskDto,
    @CurrentUser() user: User,
  ): Promise<typeof TaskResponseType> {
    try {
      const task = await this.taskService.createTask(data.content, user.id);
      return { status: 'ok', data: task };
    } catch (error) {
      throw new CustomError('error', 'Internal server error');
    }
  }

  @Mutation(() => TaskResponseType)
  @UseGuards(JwtAuthGuard)
  async updateTask(
    @Args('data') data: RequestUpdateTaskDto,
    @CurrentUser() user: User,
  ): Promise<typeof TaskResponseType> {
    try {
      const task = await this.taskService.updateTask(
        data.id,
        data.content,
        user.id,
      );
      return { status: 'ok', data: task };
    } catch (error) {
      throw new CustomError('error', error.message);
    }
  }

  @Mutation(() => TaskResponseType)
  @UseGuards(JwtAuthGuard)
  async deleteTask(
    @Args('data') data: TaskIdDto,
    @CurrentUser() user: User,
  ): Promise<typeof TaskResponseType> {
    try {
      const task = await this.taskService.deleteTask(data.id, user.id);
      return { status: 'ok', data: task };
    } catch (error) {
      throw new CustomError('error', error.message);
    }
  }

  @Mutation(() => TaskResponseType)
  @UseGuards(JwtAuthGuard)
  async completeTask(
    @Args('data') data: TaskIdDto,
    @CurrentUser() user: User,
  ): Promise<typeof TaskResponseType> {
    try {
      const task = await this.taskService.completeTask(data.id, user.id);
      return { status: 'ok', data: task };
    } catch (error) {
      throw new CustomError('error', error.message);
    }
  }

  @Mutation(() => TaskResponseType)
  @UseGuards(JwtAuthGuard)
  async uncompleteTask(
    @Args('data') data: TaskIdDto,
    @CurrentUser() user: User,
  ): Promise<typeof TaskResponseType> {
    try {
      const task = await this.taskService.uncompleteTask(data.id, user.id);
      return { status: 'ok', data: task };
    } catch (error) {
      throw new CustomError('error', error.message);
    }
  }
}

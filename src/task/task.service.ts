import { Injectable } from '@nestjs/common';
import { Task } from '@prisma/client';
import { GraphQLError } from 'graphql';
import { TaskRepository } from './repository/task.repository';
import { TaskCountDto } from './dto/task-count.dto';

@Injectable()
export class TaskService {
  constructor(private readonly taskRepository: TaskRepository) {}

  public async getTasks(userId: number): Promise<Task[]> {
    return this.taskRepository.findTasksByUserId(userId);
  }

  public async getTaskCount(userId: number): Promise<TaskCountDto> {
    const completedTaskCount = await this.taskRepository.countTasksByUserId(
      userId,
      true,
    );
    const totalTaskCount = await this.taskRepository.countTasksByUserId(userId);

    return { completedTaskCount, totalTaskCount };
  }

  public async findTask(id: number, userId: number): Promise<Task> {
    const task = await this.taskRepository.findTaskByIdAndUserId(id, userId);

    if (!task) {
      throw new GraphQLError('태스크를 찾을 수 없거나 작성한 유저가 아닙니다.');
    }

    return task;
  }

  public async createTask(content: string, userId: number): Promise<Task> {
    return this.taskRepository.createTask({ content, userId: Number(userId) });
  }

  public async updateTask(
    id: number,
    content: string,
    userId: number,
  ): Promise<Task> {
    await this.findTask(id, userId);
    return this.taskRepository.updateTask(id, { content });
  }

  public async deleteTask(id: number, userId: number): Promise<Task> {
    await this.findTask(id, userId);
    return this.taskRepository.updateTask(id, { deletedAt: new Date() });
  }

  public async completeTask(id: number, userId: number): Promise<Task> {
    await this.findTask(id, userId);
    return this.taskRepository.updateTask(id, { isDone: true });
  }

  public async uncompleteTask(id: number, userId: number): Promise<Task> {
    await this.findTask(id, userId);
    return this.taskRepository.updateTask(id, { isDone: false });
  }
}

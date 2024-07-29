import { Injectable } from '@nestjs/common';
import { Task } from '@prisma/client';
import { TaskRepository } from './repository/task.repository';
import { TaskCountDto } from './dto/task-count.dto';
import { CustomError } from '../common/error/custom-error';

@Injectable()
export class TaskService {
  constructor(private readonly taskRepository: TaskRepository) {}

  /** 태스크 전체 조회 */
  public async getTasks(userId: number): Promise<Task[]> {
    const tasks = await this.taskRepository.findTasksByUserId(userId);

    if (!tasks || tasks.length === 0) {
      throw new CustomError('error', '태스크를 찾을 수 없습니다.');
    }

    return tasks;
  }

  /** 태스크 개수 조회 */
  public async getTaskCount(userId: number): Promise<TaskCountDto> {
    const completedTaskCount: number =
      await this.taskRepository.countTasksByUserId(userId, true);
    const totalTaskCount: number =
      await this.taskRepository.countTasksByUserId(userId);

    return { completedTaskCount, totalTaskCount };
  }

  /** 해당 태스크 조회 */
  public async findTask(
    id: number,
    userId: number,
  ): Promise<CustomError | Task> {
    const task = await this.taskRepository.findTaskByIdAndUserId(id, userId);

    if (!task || task.deletedAt !== null) {
      throw new CustomError(
        'error',
        '태스크를 찾을 수 없거나 작성한 유저가 아닙니다.',
      );
    }

    return task;
  }

  /** 태스크 생성 */
  public async createTask(content: string, userId: number): Promise<Task> {
    return this.taskRepository.createTask({ content, userId: Number(userId) });
  }

  /** 태스크 업데이트 */
  public async updateTask(
    id: number,
    content: string,
    userId: number,
  ): Promise<Task> {
    await this.findTask(id, userId);
    return this.taskRepository.updateTask(id, { content });
  }

  /** 태스크 삭제 */
  public async deleteTask(id: number, userId: number): Promise<Task> {
    await this.findTask(id, userId);
    return this.taskRepository.updateTask(id, { deletedAt: new Date() });
  }

  /** 태스크 완료 */
  public async completeTask(id: number, userId: number): Promise<Task> {
    await this.findTask(id, userId);
    return this.taskRepository.updateTask(id, { isDone: true });
  }

  /** 태스크 완료 취소 */
  public async uncompleteTask(id: number, userId: number): Promise<Task> {
    await this.findTask(id, userId);
    return this.taskRepository.updateTask(id, { isDone: false });
  }
}
